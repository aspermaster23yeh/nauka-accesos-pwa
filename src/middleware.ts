import { defineMiddleware } from "astro:middleware";
import { getProfileForUser, getUserFromAccessToken, type AppRole, type UserProfile } from "./lib/supabase";

const protectedByRole: Record<AppRole, string[]> = {
  residente: ["/residente"],
  guardia: ["/guardia"],
  admin: ["/admin"]
};

function getRequiredRole(pathname: string): AppRole | null {
  if (protectedByRole.admin.some((prefix) => pathname.startsWith(prefix))) return "admin";
  if (protectedByRole.guardia.some((prefix) => pathname.startsWith(prefix))) return "guardia";
  if (protectedByRole.residente.some((prefix) => pathname.startsWith(prefix))) return "residente";
  return null;
}

function isPublicPath(pathname: string): boolean {
  return pathname === "/" || pathname === "/registro" || pathname.startsWith("/auth") || pathname.startsWith("/api/auth") || pathname.startsWith("/pase/");
}

function roleHome(role: AppRole): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "guardia") return "/guardia/escaner";
  return "/residente/inicio";
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
  const requiredRole = pathname.startsWith("/api") ? getRequiredRole(pathname.replace("/api", "")) : getRequiredRole(pathname);
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
    if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
      if (requiredRole && (!profile || profile.role !== requiredRole)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      return next();
    }

    if (publicPath) {
      return next();
    }

    if (!requiredRole) return next();

    if (!user || !profile) {
      return context.redirect("/");
    }
    if (profile.role !== requiredRole) {
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
