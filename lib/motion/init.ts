// Inline in <head>: mark html.motion before first paint so animated parts start hidden
// instead of flashing their final state. If the app never takes over (JS error, slow
// bundle), the class is removed after 4s and everything shows as static.
export const MOTION_INIT = `(function(){try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var d=document.documentElement;d.classList.add('motion');setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.remove('motion')},4000)}catch(e){}})();`;
