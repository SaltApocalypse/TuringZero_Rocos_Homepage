import * as THREE from 'three';
import GSAP from "gsap";

import Experience from "../Experience";

export default class Stage {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.time = this.experience.time;
        this.selectItem = this.resources.items.robot;
        this.modelScene = this.selectItem.scene;
        this.modelScene.name = "model";
        this.model = this.modelScene.children[0];

        this.lerp = {
            current: 0,
            target: 0,
            ease: 0.1,
        }

        this.setStage();
        this.setModel();
        this.onMouseMove();
    }

    setStage () {
        const height = 10;
        const geometry = new THREE.CylinderGeometry(2, 2, height, 64);
        const material = new THREE.MeshToonMaterial({ color: 0x6588D7 });
        this.cylinder = new THREE.Mesh(geometry, material);
        this.cylinder.position.set(0, -height, 0);
        this.cylinder.castShadow = true;
        this.cylinder.receiveShadow = true;
        this.cylinder.material.transparent = true;
        this.cylinder.material.opacity = 0;
        this.cylinder.height = height;
        this.scene.add(this.cylinder);
    }

    setModel () {
        const scale = 10;
        this.model.scale.set(scale, scale, scale);
        this.model.position.set(0, -1.7, 0);

        this.model.children.forEach((child) => {
            child.castShadow = true;
            child.receiveShadow = true;
            child.initPosition_z = child.position.z;
            child.position.z += 2;
        })

        this.scene.add(this.model);
    }

    // setModel () {
    // this.lllllllllllllllll = []; // NOTE: 如果不能运行，请把这行放到 :16 之后
    //     const scale = 10;

    //     const num = 10;
    //     this.nummmmmm = num ** 2;

    //     for (let i = 0; i < num; i++)
    //         for (let j = 0; j < num; j++) {
    //             const modelCopy = this.model.clone();

    //             modelCopy.scale.set(scale, scale, scale);
    //             modelCopy.position.set(i, 0.3, j);
    //             modelCopy.initPosition_z = modelCopy.position.z + 2;

    //             this.lllllllllllllllll.push(modelCopy);
    //             this.scene.add(modelCopy);
    //         }
    // }

    onMouseMove () {
        window.addEventListener("mousemove", (e) => {
            const rotation = ((e.clientX - window.innerWidth / 2)) * 2 / window.innerWidth;
            this.lerp.target = rotation * 0.1;
        });
    }

    resize () { }

    update () {
        this.lerp.current = GSAP.utils.interpolate(
            this.lerp.current,
            this.lerp.target,
            this.lerp.ease
        );

        this.modelScene.rotation.y = this.lerp.current;
    }
}