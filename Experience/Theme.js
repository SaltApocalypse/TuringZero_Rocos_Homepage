import { EventEmitter } from "events";

export default class Theme extends EventEmitter {
    constructor() {
        super();

        // 默认日渐主题
        this.theme = "light";

        this.toggleButton = document.querySelector(".toggle-button");
        this.toggleCircle = document.querySelector(".toggle-circle");

        this.setEventListeners();
    }

    // 事件监听：对 toggleButton 的单击事件
    setEventListeners () {
        // 右上角的切换按钮
        this.toggleButton.addEventListener("click", () => {
            this.toggleCircle.classList.toggle("slide");
            this.theme = this.theme === "light" ? "dark" : "light";
            this.emit("switchMode", this.theme);
        })
    }
}