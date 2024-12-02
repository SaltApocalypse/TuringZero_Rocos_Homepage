import * as THREE from 'three';
import * as GUI from 'dat.gui';
import GSAP from 'gsap';


import Experience from "../Experience";

export default class Debug {
    constructor() {
        this.experience = new Experience();
        this.camera = this.experience.camera;
        this.scene = this.experience.scene;

        this.isDisassemble = false;
        this.model = this.experience.world.stage.model;
        this.cylinder = this.experience.world.stage.cylinder;

        this.getCameraPosition();
        this.disassembleModel();

        // this.getGUI();

        // this.setGridHelper();
        // this.setAxesHelper();
    }

    getCameraPosition () {
        window.addEventListener("keypress", (e) => {
            const char = e.key;
            if (char === 'f') {
                console.log("DEBUG: perspectiveCamera's position",
                    '\nx:', this.camera.perspectiveCamera.position.x,
                    '\ny:', this.camera.perspectiveCamera.position.y,
                    '\nz:', this.camera.perspectiveCamera.position.z);

                // console.log("DEBUG: perspectiveCamera's direction",
                //     '\nx:', this.camera.perspectiveCamera.getWorldDirection(new THREE.Vector3()).x,
                //     '\ny:', this.camera.perspectiveCamera.getWorldDirection(new THREE.Vector3()).y,
                //     '\nz:', this.camera.perspectiveCamera.getWorldDirection(new THREE.Vector3()).z);

                // console.log("DEBUG: perspectiveCamera's rotation",
                //     '\nx:', this.camera.perspectiveCamera.rotation.x,
                //     '\ny:', this.camera.perspectiveCamera.rotation.y,
                //     '\nz:', this.camera.perspectiveCamera.rotation.z);
            }
            else if (char === 'c') {
                console.log("DEBUG: cylinder's position",
                    '\nx:', this.cylinder.position.x,
                    '\ny:', this.cylinder.position.y,
                    '\nz:', this.cylinder.position.z);

                console.log("DEBUG: model's position",
                    '\nx:', this.model.position.x,
                    '\ny:', this.model.position.y,
                    '\nz:', this.model.position.z);
            }
        })
    }

    disassembleModel () {
        window.addEventListener("keypress", (e) => {
            const char = e.key;
            if (char === 'q' && !this.isDisassemble) {
                if (!this.model.children[0].startPosition) {
                    this.model.children.forEach((child) => {
                        child.startPosition = child.position.clone();
                    })
                };
                let counter = 0;

                console.log("DEBUG: Disassemble the model.");
                this.model.children.forEach((child) => {
                    counter++;
                    GSAP.to(child.position, { z: child.position.z + counter * 0.05, duration: 2, ease: "power1.inOut" });
                })
                this.isDisassemble = true;
            }
            else if (char === 'e' && this.isDisassemble) {
                console.log("DEBUG: Merge the model.")
                this.model.children.forEach((child) => {
                    GSAP.to(child.position, { z: child.startPosition.z, duration: 2, ease: "power1.inOut" });
                })
                this.isDisassemble = false;
            }
        })
    }

    getGUI () {
        const gui = new GUI.GUI();
        const obj = {
            color: { r: 0, g: 0, b: 0 },
            intensity: 1,
        };

        gui.addColor(obj, "color")
            .onChange(() => {
                this.experience.world.enivronment.ambientLight.color.copy(obj.color);
            })
        gui.addColor(obj, "intensity", 0, 10, 0.1)
            .onChange(() => {
                this.experience.world.enivronment.ambientLight.intensity = (obj.intensity);
            });
    }

    setGridHelper () {
        const size = 20;
        const divisions = 20;
        const gridHelper = new THREE.GridHelper(size, divisions);
        this.scene.add(gridHelper)
    }

    setAxesHelper () {
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }
}