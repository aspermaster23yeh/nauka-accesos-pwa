import { defineMiddleware } from "astro:middleware";
import { getRoleHome } from "./lib/role-home";
import { getProfileForUser, getUserFromAccessToken, type AppRole, type UserProfile } from "./lib/supabase";
import { canExportBitacora, isCommitteeReader, isCommitteeReaderAdminPath, isPlatformAdmin } from "./lib/admin-access";

const protectedByRole: Record<AppRole, string[]> = {
  super_admin: [],
  admin: ["/admin", "/api/admin", "/api/super-admin"],
  lector_junta: [],
  guardia: ["/guardia", "/api/guardia"],
  solicitante: ["/solicitante", "/api/solicitante"]
};

function getRequiredRole(pathname: string): AppRole | null {
  if (pathname.startsWith("/api/super-admin")) return "admin";
  if (pathname.startsWith("/api/admin")) return "admin";
  if (pathname.startsWith("/admin")) return "admin";
  if (protectedByRole.guardia.some((prefix) => pathname.startsWith(prefix))) return "guardia";
  if (protectedByRole.solicitante.some((prefix) => pathname.startsWith(prefix))) return "solicitante";
  return null;
}

/** Lector comité: solo export CSV de bitácora (GET). */
function lectorMayAccessAdminApi(apiPath: string, method: string): boolean {
  return method === "GET" && apiPath === "/admin/bitacora-export";
}

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/registro" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/pase/")
  );
}

function isOnboardingPath(pathname: string): boolean {
  return pathname.startsWith("/onboarding/") || pathname.startsWith("/api/onboarding");
}

function needsTermsAcceptance(profile: UserProfile): boolean {
  if (isPlatformAdmin(profile.role)) return false;
  return !profile.terms_accepted_at && ["solicitante", "guardia"].includes(profile.role);
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => resolve(null), ms);
  });
  const result = await Promise.race([promise, timeoutPromise]);
  if (timeoutId) clearTimeout(timeoutId);
  return result as T | null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  if (pathname.startsWith("/super-admin")) {
    let rest = pathname.slice("/super-admin".length);
    if (!rest || rest === "/") rest = "/dashboard";
    return context.redirect(`/admin${rest}${context.url.search}`, 308);
  }

  const accessToken = context.cookies.get("sb-access-token")?.value;
  const publicPath = isPublicPath(pathname);
  const apiPath = pathname.startsWith("/api") ? pathname.replace(/^\/api/, "") || "/" : pathname;
  const requiredRole = pathname.startsWith("/api") ? getRequiredRole(apiPath) : getRequiredRole(pathname);
  const shouldResolveAuth = Boolean(accessToken && !publicPath);

  let user = null;
  let profile: UserProfile | null = null;
  try {
    if (shouldResolveAuth && accessToken) {
      user = await withTimeout(getUserFromAccessToken(accessToken), 1200);
      if (user) {
        profile = await withTimeout(getProfileForUser(user.id, accessToken), 1200);
      }
    }
  } catch {
    user = null;
    profile = null;
  }

  context.locals.user = user;
  context.locals.profile = profile;
  context.locals.role = profile?.role ?? null;
  context.locals.accessToken = accessToken ?? null;

  try {
    if (pathname.startsWith("/api/onboarding")) {
      if (!user || !profile) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      return next();
    }

    if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
      if (requiredRole === "admin") {
        const method = context.request.method.toUpperCase();
        if (isPlatformAdmin(profile?.role)) {
          /* ok */
        } else if (profile?.role === "lector_junta" && lectorMayAccessAdminApi(apiPath, method) && canExportBitacora(profile.role)) {
          /* ok */
        } else {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
      } else if (requiredRole && (!profile || profile.role !== requiredRole)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      return next();
    }

    if (publicPath) {
      return next();
    }

    if (!requiredRole) {
      if (pathname.startsWith("/onboarding") && !user) {
        return context.redirect("/");
      }
      if (user && profile) {
        const exemptOnboarding = isPlatformAdmin(profile.role) || isCommitteeReader(profile.role);
        if (!exemptOnboarding && profile.onboarding_status === "suspendido" && !pathname.startsWith("/onboarding/cuenta-suspendida")) {
          return context.redirect("/onboarding/cuenta-suspendida");
        }
        if (!exemptOnboarding && profile.onboarding_status === "pendiente_ine" && !pathname.startsWith("/onboarding/pendiente-ine")) {
          return context.redirect("/onboarding/pendiente-ine");
        }
        if (needsTermsAcceptance(profile) && !isOnboardingPath(pathname)) {
          return context.redirect("/onboarding/terminos");
        }
      }
      return next();
    }

    if (!user || !profile) {
      return context.redirect("/");
    }

    if (isPlatformAdmin(profile.role) || isCommitteeReader(profile.role)) {
      /* sin bloqueos de términos / INE para operadores de plataforma y comité */
    } else if (profile.onboarding_status === "suspendido") {
      if (!pathname.startsWith("/onboarding/cuenta-suspendida")) {
        return context.redirect("/onboarding/cuenta-suspendida");
      }
      return next();
    } else if (profile.onboarding_status === "pendiente_ine") {
      if (!pathname.startsWith("/onboarding/pendiente-ine")) {
        return context.redirect("/onboarding/pendiente-ine");
      }
      return next();
    } else if (needsTermsAcceptance(profile) && !isOnboardingPath(pathname)) {
      return context.redirect("/onboarding/terminos");
    }

    if (requiredRole === "admin") {
      if (isPlatformAdmin(profile.role)) {
        /* full admin */
      } else if (profile.role === "lector_junta" && isCommitteeReaderAdminPath(pathname)) {
        /* lectura comité */
      } else {
        return context.redirect(getRoleHome(profile.role));
      }
    } else if (requiredRole && profile.role !== requiredRole) {
      return context.redirect(getRoleHome(profile.role));
    }
    return next();
  } catch {
    if (isPublicPath(pathname)) return next();
    if (pathname.startsWith("/api")) {
      return new Response(JSON.stringify({ error: "Server auth middleware failed" }), { status: 500 });
    }
    return context.redirect("/");
  }
});
