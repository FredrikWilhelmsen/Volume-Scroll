import * as controller from "./VolumeScrollController";

window.addEventListener("wheel", controller.onScroll, { passive: false, capture: true });
window.addEventListener("mousedown", controller.onMouseDown, { passive: false });
window.addEventListener("mouseup", controller.onMouseUp, { passive: false });
window.addEventListener("keydown", controller.onKeyDown, { passive: false });
window.addEventListener("keyup", controller.onKeyUp);
window.addEventListener("mousemove", controller.onMouseMove);
window.addEventListener("contextmenu", controller.onContextMenu);
controller.init();