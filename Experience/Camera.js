import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import Experience from "./Experience";

export default class Camera {
    constructor() {
        this.experience = new Experience();
        this.canvas = this.experience.canvas;
        this.scene = this.experience.scene;
        this.sizes = this.experience.sizes;

        this.createPerspectiveCamera();
        this.createOrthographicCamera();
        this.setOrbitControls();
    }

    createPerspectiveCamera () {
        this.perspectiveCamera = new THREE.PerspectiveCamera(35, this.sizes.aspect, 0.1, 1000);
        this.perspectiveCamera.position.set(4, 3, 6.5);
        this.perspectiveCamera.lookAt(0, 0, 0);
        this.scene.add(this.perspectiveCamera);
    }

    createOrthographicCamera () {
        this.orthographicCamera = new THREE.OrthographicCamera(
            (-this.sizes.aspect * this.sizes.frustrum) / 2, (this.sizes.aspect * this.sizes.frustrum) / 2,
            this.sizes.frustrum / 2, -this.sizes.frustrum / 2,
            -50, 50
        )
        this.scene.add(this.orthographicCamera);

        // this.helper = new THREE.CameraHelper(this.orthographicCamera);
        // this.scene.add(this.helper);
    }

    setOrbitControls () {
        this.controls = new OrbitControls(this.perspectiveCamera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.enableZoom = true;
    }

    resize () {
        scrollTo(0, 0); // 固定页面
        this.perspectiveCamera.aspect = this.sizes.aspect;
        this.perspectiveCamera.updateProjectionMatrix();

        this.orthographicCamera.left = (-this.sizes.aspect * this.sizes.frustrum) / 2;
        this.orthographicCamera.right = (this.sizes.aspect * this.sizes.frustrum) / 2;
        this.orthographicCamera.top = this.sizes.frustrum / 2;
        this.orthographicCamera.bottom = -this.sizes.frustrum / 2;
        this.orthographicCamera.updateProjectionMatrix();
    }

    update () {
        this.controls.update();

        // this.helper.matrixWorldNeedsUpdate = true;
        // this.helper.update();
        // this.helper.position.copy(this.orthographicCamera.position);
        // this.helper.rotation.copy(this.orthographicCamera.rotation);
    }

}