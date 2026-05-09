import { d as defineMiddleware, s as sequence } from './chunks/index_D0NsaHru.mjs';
import { g as getUserFromAccessToken, a as getProfileForUser } from './chunks/supabase_DBfBwpCC.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_D1YOGrb_.mjs';
import 'piccolore';
import './chunks/astro/server_C6rdUW15.mjs';
import 'clsx';

const protectedByRole = {
  residente: ["/residente"],
  guardia: ["/guardia"],
  admin: ["/admin"]
};
function getRequiredRole(pathname) {
  if (protectedByRole.admin.some((prefix) => pathname.startsWith(prefix))) return "admin";
  if (protectedByRole.guardia.some((prefix) => pathname.startsWith(prefix))) return "guardia";
  if (protectedByRole.residente.some((prefix) => pathname.startsWith(prefix))) return "residente";
  return null;
}
function isPublicPath(pathname) {
  return pathname === "/" || pathname === "/registro" || pathname.startsWith("/api/auth");
}
function roleHome(role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "guardia") return "/guardia/escaner";
  return "/residente/inicio";
}
const onRequest$1 = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  const accessToken = context.cookies.get("sb-access-token")?.value;
  let user = null;
  let profile = null;
  if (accessToken) {
    user = await getUserFromAccessToken(accessToken);
    if (user) {
      profile = await getProfileForUser(user.id, accessToken);
    }
  }
  context.locals.user = user;
  context.locals.profile = profile;
  context.locals.role = profile?.role ?? null;
  context.locals.accessToken = accessToken ?? null;
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
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
