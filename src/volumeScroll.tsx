import * as controller from "./volumeScrollController";

window.addEventListener("wheel", controller.onScroll, { passive: false });
window.addEventListener("mousedown", controller.onMouseDown, { passive: false });
window.addEventListener("mouseup", controller.onMouseUp, { passive: false });
window.addEventListener("keydown", controller.onKeyDown, { passive: false });
window.addEventListener("keyup", controller.onKeyUp);
window.addEventListener("mousemove", controller.onMouseMove);
controller.init();