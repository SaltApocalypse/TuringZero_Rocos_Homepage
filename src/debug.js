import * as THREE from 'three';

export function DEBUG_TEST (scene) {
    directionLight(scene);
}

function directionLight (scene) {
    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    scene.add(light);

    const helper = new THREE.DirectionalLightHelper(light, 5);
    scene.add(helper);
}
