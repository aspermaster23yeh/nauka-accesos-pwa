import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_DVaOae6a.mjs';
import { manifest } from './manifest_CWaNdpM2.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/bitacora.astro.mjs');
const _page2 = () => import('./pages/api/validar-qr.astro.mjs');
const _page3 = () => import('./pages/guardia/escaner.astro.mjs');
const _page4 = () => import('./pages/registro.astro.mjs');
const _page5 = () => import('./pages/residente/nuevo-pase.astro.mjs');
const _page6 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/bitacora.astro", _page1],
    ["src/pages/api/validar-qr.ts", _page2],
    ["src/pages/guardia/escaner.astro", _page3],
    ["src/pages/registro.astro", _page4],
    ["src/pages/residente/nuevo-pase.astro", _page5],
    ["src/pages/index.astro", _page6]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "4b98b546-c325-4ca5-8b08-f3929a9d5ef9",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
