import * as THREE from 'three';

import Experience from "../Experience";

export default class Floor {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;

        this.setFloor();
    }

    setFloor () {
        const side = 100;
        const halfSide = Math.floor(side / 2);
        const depth = -5;

        const planeXZ = new THREE.Mesh(
            new THREE.PlaneGeometry(side, side),
            new THREE.MeshToonMaterial({ color: 0x4A628A }));
        planeXZ.receiveShadow = true;

        planeXZ.rotation.set(-Math.PI / 2, 0, 0);
        planeXZ.position.set(0, depth, 0);

        const planeYZ = planeXZ.clone();
        planeYZ.rotation.set(0, Math.PI / 2, 0);
        planeYZ.position.set(-halfSide, halfSide + depth, 0);

        const planeYZ2 = planeXZ.clone();
        planeYZ2.rotation.set(0, -Math.PI / 2, 0);
        planeYZ2.position.set(halfSide, halfSide + depth, 0);

        const planeXY = planeXZ.clone();
        planeXY.rotation.set(0, 0, Math.PI / 2);
        planeXY.position.set(0, halfSide + depth, -halfSide);

        this.scene.add(planeXZ, planeYZ, planeYZ2, planeXY);
    }

    resize () { }

    update () { }
}