import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_Cabzgbuj.mjs';
import { manifest } from './manifest_Dl6aHrtQ.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/bitacora.astro.mjs');
const _page2 = () => import('./pages/admin/dashboard.astro.mjs');
const _page3 = () => import('./pages/admin/detalle-movimiento.astro.mjs');
const _page4 = () => import('./pages/api/admin/incidentes.astro.mjs');
const _page5 = () => import('./pages/api/admin/metrics.astro.mjs');
const _page6 = () => import('./pages/api/auth/login.astro.mjs');
const _page7 = () => import('./pages/api/auth/logout.astro.mjs');
const _page8 = () => import('./pages/api/auth/register.astro.mjs');
const _page9 = () => import('./pages/api/guardia/registrar-movimiento.astro.mjs');
const _page10 = () => import('./pages/api/residente/pases.astro.mjs');
const _page11 = () => import('./pages/api/validar-qr.astro.mjs');
const _page12 = () => import('./pages/guardia/acceso-denegado.astro.mjs');
const _page13 = () => import('./pages/guardia/escaner.astro.mjs');
const _page14 = () => import('./pages/registro.astro.mjs');
const _page15 = () => import('./pages/residente/inicio.astro.mjs');
const _page16 = () => import('./pages/residente/nuevo-pase.astro.mjs');
const _page17 = () => import('./pages/residente/pase-demo.astro.mjs');
const _page18 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/bitacora.astro", _page1],
    ["src/pages/admin/dashboard.astro", _page2],
    ["src/pages/admin/detalle-movimiento.astro", _page3],
    ["src/pages/api/admin/incidentes.ts", _page4],
    ["src/pages/api/admin/metrics.ts", _page5],
    ["src/pages/api/auth/login.ts", _page6],
    ["src/pages/api/auth/logout.ts", _page7],
    ["src/pages/api/auth/register.ts", _page8],
    ["src/pages/api/guardia/registrar-movimiento.ts", _page9],
    ["src/pages/api/residente/pases.ts", _page10],
    ["src/pages/api/validar-qr.ts", _page11],
    ["src/pages/guardia/acceso-denegado.astro", _page12],
    ["src/pages/guardia/escaner.astro", _page13],
    ["src/pages/registro.astro", _page14],
    ["src/pages/residente/inicio.astro", _page15],
    ["src/pages/residente/nuevo-pase.astro", _page16],
    ["src/pages/residente/pase-demo.astro", _page17],
    ["src/pages/index.astro", _page18]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "bc13b0e4-1956-4415-b2ac-97e9114d5e5b",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
