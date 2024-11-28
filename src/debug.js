import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

export function DEBUG_TEST (scene, camera) {
    directionLight(scene);
    // createText(scene, camera);
}

function directionLight (scene) {
    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    scene.add(light);

    const helper = new THREE.DirectionalLightHelper(light, 5);
    scene.add(helper);
}
