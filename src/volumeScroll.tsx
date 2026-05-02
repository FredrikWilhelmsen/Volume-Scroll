import * as controller from "./VolumeScrollController";

window.addEventListener("wheel", controller.onScroll, { passive: false, capture: true });
window.addEventListener("mousedown", controller.onMouseDown, { passive: false, capture: true });
window.addEventListener("mouseup", controller.onMouseUp, { passive: false, capture: true });
window.addEventListener("keydown", controller.onKeyDown, { passive: false, capture: true });
window.addEventListener("keyup", controller.onKeyUp, { capture: true });
window.addEventListener("mousemove", controller.onMouseMove, { capture: true });
window.addEventListener("contextmenu", controller.onContextMenu, { capture: true });
window.addEventListener("auxclick", controller.onAuxClick, { capture: true });
controller.init();