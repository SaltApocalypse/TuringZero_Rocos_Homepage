import * as THREE from "three";

import Experience from "./Experience";

export default class Renderer {
    constructor() {
        this.experience = new Experience();
        this.canvas = this.experience.canvas;
        this.scene = this.experience.scene;
        this.sizes = this.experience.sizes;
        this.camera = this.experience.camera;

        this.setRenderer();
    }

    setRenderer () {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });

        // 渲染器设置
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.SRGBEncoding;
        this.renderer.toneMapping = THREE.CineonToneMapping;
        this.renderer.toneMappingExposure = 1.25;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(this.sizes.pixelRatio)

    }

    resize () {
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(this.sizes.pixelRatio);
    }

    update () {
        this.renderer.render(this.scene, this.camera.perspectiveCamera);
    }

}