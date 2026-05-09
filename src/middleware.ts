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
  return pathname === "/" || pathname === "/registro" || pathname.startsWith("/api/auth");
}

function roleHome(role: AppRole): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "guardia") return "/guardia/escaner";
  return "/residente/inicio";
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  const accessToken = context.cookies.get("sb-access-token")?.value;

  let user = null;
  let profile: UserProfile | null = null;
  try {
    if (accessToken) {
      user = await getUserFromAccessToken(accessToken);
      if (user) {
        profile = await getProfileForUser(user.id, accessToken);
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
      const requiredApiRole = getRequiredRole(pathname.replace("/api", ""));
      if (requiredApiRole && (!profile || profile.role !== requiredApiRole)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      return next();
    }

    if (isPublicPath(pathname)) {
      if (user && profile && (pathname === "/" || pathname === "/registro")) {
        return context.redirect(roleHome(profile.role));
      }
      return next();
    }

    const requiredRole = getRequiredRole(pathname);
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
