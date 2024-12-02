import * as THREE from "three";
import GSAP from "gsap";

import Experience from "../Experience";

export default class Controls {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.sizes = this.experience.sizes;
        this.camera = this.experience.camera;
        this.stage = this.experience.world.stage;
        this.cylinder = this.stage.cylinder;
        this.model = this.stage.model;

        // 页码切换
        this.currentPage = 0;
        this.TOTALPAGE = 5;
        // 模型合并
        this.isDisassemble = false;

        // preloader
        this.preloader = this.experience.preloader;
        // 载入函数数组
        this.pageListEnter = [
            () => this.page0(true),
            () => this.page1(true),
            () => this.page2(true),
            () => this.page3(true),
            () => this.page4(true)
        ];
        this.pageListLeave = [
            () => this.page0(false),
            () => this.page1(false),
            () => this.page2(false),
            () => this.page3(false),
            () => this.page4(false)
        ];

        this.preloader.on("playIntroReady", () => {
            const timeline = GSAP.timeline();
            timeline
                // 载入按钮
                .to(document.querySelector(".toggle-bar"), { top: "48px" })
                // 镜头拉远
                .to(this.camera.perspectiveCamera.position, {
                    x: 25, y: 19, z: 41,
                    duration: 1.5,
                    ease: "power2.out",
                    delay: 1,
                }, ">");

            // 载入第一页
            this.pageListEnter[this.currentPage]();
            // 加载滚轮监听事件
            this.onWheel();
        });
    }

    // 滚轮监听切页
    onWheel () {
        window.addEventListener("wheel", (e) => {
            // TODO: 现在的思路是通过每段的变化来拼起来整体效果，试着考虑能不能利用 GSAP 的插件做出更简单流畅的效果？
            if (e.deltaY > 0) { // 向下切页
                if (this.currentPage >= this.TOTALPAGE - 1) { return; }
                this.pageListLeave[this.currentPage]();
                this.currentPage++;
                this.pageListEnter[this.currentPage]();
            }
            else { // 向前切页
                if (this.currentPage <= 0) { return; }
                this.pageListLeave[this.currentPage]();
                this.currentPage--;
                this.pageListEnter[this.currentPage]();
            }
        });
    }

    /**
     * 标题页
     * @param {boolean} state true 进入 false 离开
     */
    page0 (state) {
        const timeline = GSAP.timeline({ defaults: { duration: 1.5, ease: "power1.inOut" } });
        if (state) {
            timeline
                // HTML
                .to(document.querySelector(".hero-warpper"), { opacity: 1, })
                .to(document.querySelector(".hero-main"), { bottom: "20%" }, ">")
                .to(document.querySelector(".hero-second"), { top: "10%" }, "<")
        }
        else {
            timeline
                // HTML
                .to(document.querySelector(".hero-warpper"), { opacity: 0, })
                .to(document.querySelector(".hero-main"), { bottom: "-20%" }, ">")
                .to(document.querySelector(".hero-second"), { top: "-10%" }, "<");
        }
    }

    /**
     * 
     * @param {boolean} state true 进入 false 离开
     */
    page1 (state) {
        // 等下，我知道这里写的很史，因为我还没琢磨正交相机
        // TODO:FIXME: 用正交相机修复这狗屎的一切
        const timeline = GSAP.timeline({ defaults: { duration: 1.5, ease: "expo.inOut" } });
        const section = document.querySelector(".first-section");

        if (state) {
            timeline
                // 模型
                .to(this.camera.perspectiveCamera.position, { x: 3.7, y: 0.7, z: 7.7 })
                .to(this.cylinder.position, { x: 2, y: -5.5, z: 2.5 }, "<")
                .to(this.model.position, { x: 2, y: -2.2, z: 2.5 }, "<")
                // HTML
                .to(document.querySelector(".first-section"), { left: "0" }, "<");

            section.addEventListener("wheel", this.handleSectionScroll)

        } else {
            timeline
                // 模型
                .to(this.camera.perspectiveCamera.position, { x: 25, y: 19, z: 41, })
                .to(this.cylinder.position, { x: 0, y: -5.5, z: 0 }, "<")
                .to(this.model.position, { x: 0, y: -2.2, z: 0 }, "<")
                // HTML
                .to(document.querySelector(".first-section"), { left: "-40%" }, "<");

            section.removeEventListener("wheel", this.handleSectionScroll);
        }
    }

    /**
     * 
     * @param {boolean} state true 进入 false 离开
     */
    page2 (state) {
        const timeline = GSAP.timeline({ defaults: { duration: 1.5, ease: "expo.inOut" } });
        const section = document.querySelector(".second-section");

        if (state) {
            timeline
                // 模型
                .to(this.camera.perspectiveCamera.position, { x: -4.7, y: 0.7, z: 7.7 })
                .to(this.cylinder.position, { x: -3, y: -5.5, z: 2.5 }, "<")
                .to(this.model.position, { x: -3, y: -2.2, z: 2.5 }, "<")
                // HTML
                .to(document.querySelector(".second-section"), { right: "0", ease: "power1.inOut" }, "<");

            section.addEventListener("wheel", this.handleSectionScroll)
        } else {
            timeline
                // 模型
                .to(this.camera.perspectiveCamera.position, { x: 3.7, y: 0.7, z: 7.7 })
                .to(this.cylinder.position, { x: 2, y: -5.5, z: 2.5 }, "<")
                .to(this.model.position, { x: 2, y: -2.2, z: 2.5 }, "<")
                // HTML
                .to(document.querySelector(".second-section"), { right: "-40%", ease: "power1.inOut" }, "<");

            section.removeEventListener("wheel", this.handleSectionScroll);
        }
    }

    /**
     * 
     * @param {boolean} state true 进入 false 离开
     */
    page3 (state) {
        const timeline = GSAP.timeline({ defaults: { duration: 1.5, ease: "expo.inOut" } });
        const section = document.querySelector(".second-section");

        if (state) {
            timeline
                // 模型
                .to(this.camera.perspectiveCamera.position, { x: -12.3, y: 6.3, z: 30.3 })
                .to(this.cylinder.position, { x: -7, y: -7.5, z: 2.5 }, "<")
                .to(this.model.position, { x: -7, y: -4.2, z: 2.5 }, "<") // HTML
                .to(document.querySelector(".second-section"), { right: "0", ease: "power1.inOut" }, "<");

            if (false === this.isDisassemble) {
                this.disassembleModel();
                this.isDisassemble = true;
            }

            section.addEventListener("wheel", this.handleSectionScroll)
        } else {
            timeline
                // 模型
                .to(this.camera.perspectiveCamera.position, { x: -4.7, y: 0.7, z: 7.7 })
                .to(this.cylinder.position, { x: -3, y: -5.5, z: 2.5 }, "<")
                .to(this.model.position, { x: -3, y: -2.2, z: 2.5 }, "<")
                // HTML
                .to(document.querySelector(".second-section"), { right: "0", ease: "power1.inOut" }, "<");

            if (true === this.isDisassemble) {
                this.mergeModel();
                this.isDisassemble = false;
            }

            section.removeEventListener("wheel", this.handleSectionScroll);
        }
    }


    /**
     * 
     * @param {boolean} state true 进入 false 离开
     */
    page4 (state) { }

    // 处理 section 内部滚动
    handleSectionScroll (e) {
        const section = e.currentTarget;
        const isAtTop = section.scrollTop === 0;
        const isAtBottom = section.scrollHeight - section.scrollTop === section.clientHeight;

        if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) { }
        else { e.stopPropagation(); }
    }

    disassembleModel () {
        if (!this.model.children[0].startPosition) {
            this.startPosition_minZ = 0;
            this.startPosition_maxZ = 0;

            this.model.children.forEach((child) => {
                child.startPosition = child.position.clone();
                this.startPosition_minZ = Math.min(this.startPosition_minZ, child.startPosition.z);
                this.startPosition_maxZ = Math.max(this.startPosition_maxZ, child.startPosition.z);
            })
        };
        let counter = 0;
        const posAdd = [[-0.2, -0.2], [0.2, -0.2], [0.2, 0.2], [-0.2, 0.2]];

        this.model.children.forEach((child) => {
            counter++;
            GSAP.to(child.position, {
                z: child.startPosition.z + (child.startPosition.z - this.startPosition_minZ) * 5 - 0.75,
                duration: 1.5,
                ease: "power1.inOut"
            });
            // GSAP.to(child.position, {
            //     x: child.startPosition.x + posAdd[counter % 4][0],
            //     y: child.startPosition.y + posAdd[counter % 4][1],
            //     z: child.startPosition.z + (counter % 4) * (counter / 4) * 0.05,
            //     duration: 1.5,
            //     ease: "power1.inOut"
            // });
        })
        this.isDisassemble = true;
    }

    mergeModel () {
        this.model.children.forEach((child) => {
            GSAP.to(child.position, {
                x: child.startPosition.x,
                y: child.startPosition.y,
                z: child.startPosition.z,
                duration: 1.5, ease: "power1.inOut"
            });
        })
        this.isDisassemble = false;
    }


    resize () { }

    update () { }
}