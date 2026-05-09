import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_D__XSBoc.mjs';
import { manifest } from './manifest_DAKrtfLk.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/bitacora.astro.mjs');
const _page2 = () => import('./pages/admin/detalle-movimiento.astro.mjs');
const _page3 = () => import('./pages/api/validar-qr.astro.mjs');
const _page4 = () => import('./pages/guardia/acceso-denegado.astro.mjs');
const _page5 = () => import('./pages/guardia/escaner.astro.mjs');
const _page6 = () => import('./pages/registro.astro.mjs');
const _page7 = () => import('./pages/residente/inicio.astro.mjs');
const _page8 = () => import('./pages/residente/nuevo-pase.astro.mjs');
const _page9 = () => import('./pages/residente/pase-demo.astro.mjs');
const _page10 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/bitacora.astro", _page1],
    ["src/pages/admin/detalle-movimiento.astro", _page2],
    ["src/pages/api/validar-qr.ts", _page3],
    ["src/pages/guardia/acceso-denegado.astro", _page4],
    ["src/pages/guardia/escaner.astro", _page5],
    ["src/pages/registro.astro", _page6],
    ["src/pages/residente/inicio.astro", _page7],
    ["src/pages/residente/nuevo-pase.astro", _page8],
    ["src/pages/residente/pase-demo.astro", _page9],
    ["src/pages/index.astro", _page10]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "d5e35903-1d5a-4ab8-9d48-9ce16818ab5d",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
