import { defineMiddleware } from "astro:middleware";
import { getProfileForUser, getUserFromAccessToken, type AppRole, type UserProfile } from "./lib/supabase";

const protectedByRole: Record<AppRole, string[]> = {
  super_admin: ["/super-admin", "/api/super-admin"],
  admin: ["/admin", "/api/admin"],
  guardia: ["/guardia", "/api/guardia"],
  solicitante: ["/solicitante", "/api/solicitante"]
};

function getRequiredRole(pathname: string): AppRole | null {
  if (protectedByRole.super_admin.some((prefix) => pathname.startsWith(prefix))) return "super_admin";
  if (protectedByRole.admin.some((prefix) => pathname.startsWith(prefix))) return "admin";
  if (protectedByRole.guardia.some((prefix) => pathname.startsWith(prefix))) return "guardia";
  if (protectedByRole.solicitante.some((prefix) => pathname.startsWith(prefix))) return "solicitante";
  return null;
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

function roleHome(role: AppRole): string {
  if (role === "super_admin") return "/super-admin/dashboard";
  if (role === "admin") return "/admin/dashboard";
  if (role === "guardia") return "/guardia/escaner";
  return "/solicitante/inicio";
}

function needsTermsAcceptance(profile: UserProfile): boolean {
  if (profile.role === "super_admin") return false;
  return !profile.terms_accepted_at && ["solicitante", "guardia", "admin"].includes(profile.role);
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
      if (
        requiredRole &&
        (!profile ||
          (profile.role !== requiredRole && !(requiredRole === "admin" && profile.role === "super_admin")))
      ) {
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
        if (profile.role !== "super_admin" && profile.onboarding_status === "suspendido" && !pathname.startsWith("/onboarding/cuenta-suspendida")) {
          return context.redirect("/onboarding/cuenta-suspendida");
        }
        if (profile.role !== "super_admin" && profile.onboarding_status === "pendiente_ine" && !pathname.startsWith("/onboarding/pendiente-ine")) {
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

    if (profile.role === "super_admin") {
      /* sin bloqueos de términos */
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

    if (profile.role !== requiredRole) {
      if (requiredRole === "admin" && profile.role === "super_admin") {
        return next();
      }
      return context.redirect(roleHome(profile.role));
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
