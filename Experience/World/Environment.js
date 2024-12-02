import * as THREE from 'three';
import GSAP from 'gsap';

import Experience from "../Experience";

export default class Environment {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        // this.resources = this.experience.resources;

        this.setSunlight();
    }

    setSunlight () {
        const light = new THREE.DirectionalLight("#ffffff", 3);
        light.castShadow = true;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 50;
        light.shadow.mapSize.set(2048, 2048);
        light.shadow.normalBias = 0.05;

        this.sunLight = [];
        this.sunLight.push(light);

        const light1 = light.clone();
        const light2 = light.clone();
        this.sunLight.push(light1, light2);

        this.sunLight[0].position.set(3, 5, 3);
        // this.sunLight[1].position.set(-3, 5, 3);

        this.scene.add(this.sunLight[0]);

        // const helper = new THREE.CameraHelper(this.sunLight[0].shadow.camera);
        // const clonedHelper = new THREE.CameraHelper(this.sunLight[1].shadow.camera);
        // this.scene.add(helper,clonedHelper);

        this.ambientLight = new THREE.AmbientLight("#ffffff", 3);
        this.scene.add(this.ambientLight);
    }

    switchTheme (theme) {
        if (theme === "dark") {
            GSAP.to(this.sunLight[0], { intensity: 0 });
            GSAP.to(this.sunLight[1], { intensity: 0 });
        } else {
            GSAP.to(this.sunLight[0], { intensity: 3 });
            GSAP.to(this.sunLight[1], { intensity: 3 });
        }
    }

    resize () { }

    update () { }
}