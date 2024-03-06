import { onScroll, onClick } from "./volumeScrollController";

document.addEventListener("wheel", onScroll);
document.addEventListener("click", onClick);