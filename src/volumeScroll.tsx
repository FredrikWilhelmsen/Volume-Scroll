import * as controller from "./volumeScrollController";

document.addEventListener("wheel", controller.onScroll);
document.addEventListener("click", controller.onClick);