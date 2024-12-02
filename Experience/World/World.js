import { EventEmitter } from "events";

import Controls from "./Controls";
import Environment from "./Environment";
import Floor from "./Floor";
import Stage from "./Stage";

import Experience from "../Experience";

import Debug from "../Utils/Debug";

export default class World extends EventEmitter {
    constructor() {
        super();
        this.experience = new Experience();
        this.canvas = this.experience.canvas;
        this.scene = this.experience.scene;
        this.sizes = this.experience.sizes;
        this.camera = this.experience.camera;
        this.resources = this.experience.resources;
        this.theme = this.experience.theme;

        // 资源加载完毕后进行场景建设
        this.resources.on("resourcesReady", () => {
            this.enivronment = new Environment();
            this.floor = new Floor();
            this.stage = new Stage();
            this.controls = new Controls();
            console.log("World: World was loaded.");
            this.emit("worldReady");
        });

        this.theme.on("switchMode", (theme) => {
            if (this.enivronment) {
                this.enivronment.switchTheme(theme);
            }
        });

        // NOTE: 最后加载的 Debug 模块
        this.on("worldReady", () => {
            this.debug = new Debug();
        })
    }

    resize () { }

    update () {
        if (this.stage) { this.stage.update(); }
        if (this.controls) { this.controls.update(); }
    }
}