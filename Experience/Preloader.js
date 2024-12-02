import { EventEmitter } from "events";
import GSAP from 'gsap';

import Experience from "./Experience";

export default class Preloader extends EventEmitter {
    constructor() {
        super();
        this.experience = new Experience();
        this.world = this.experience.world;
        this.camera = this.experience.camera;
        this.sizes = this.experience.sizes;
        this.resources = this.experience.resources;
        this.time = this.experience.time;

        this.world.on("worldReady", () => {
            this.stage = this.world.stage;
            this.cylinder = this.world.stage.cylinder;
            this.model = this.world.stage.model;

            scrollTo(0, 0); // 固定页面
            this.playIntro();
        })
    }

    playIntro () {
        // 时间线动画
        // NOTE: https://gsap.framer.wiki/timelines
        let timeline = GSAP.timeline();

        // 柱子升起
        timeline
            .to(this.cylinder.position, {
                y: -5,
                duration: 0.5,
                ease: 'power1.inOut',
            })
            .to(this.cylinder.material, {
                opacity: 1,
                duration: 0.5,
                ease: 'power1.in',
            }, "<");

        // 足球机器人载入
        // ==================================

        // const mdl = this.stage.lllllllllllllllll;
        // for (let i = 0; i < this.stage.nummmmmm; i++) {
        //     mdl[i].children.forEach((child) => {
        //         timeline.to(child.position, {
        //             z: mdl[i].initPosition_z - 2,
        //             duration: 0.2,
        //             ease: "power1.inOut",
        //             delay: 0.05,
        //         }, "<")
        //     });
        // }

        // ==================================

        this.model.children.forEach((child) => {
            // FIXME: 处理动画细节
            timeline.to(child.position, {
                z: child.initPosition_z,
                duration: 0.2,
                ease: "power1.inOut",
                delay: 0.05,
            }, "<")
        });

        // 载入按钮、镜头拉远和载入第一页在 Controls.js

        // 加载完成
        this.emit("playIntroReady");
    }
}