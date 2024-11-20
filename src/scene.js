// ==================== scene.js ==================== //
// Describe: 基本场景实现
// ================================================ //
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// 轴线
export const axesHelper = new THREE.AxesHelper(100);
// 网格
export const gridHelper = new THREE.GridHelper(11, 11);

export function initScene () {
    // 场景 相机 渲染器
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#6588D7');

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 装进 canva 里，这样周围就不会有白边了 XD
    const container = document.getElementById('canvas-container');
    container.appendChild(renderer.domElement);

    // 鼠标控制
    const controls = new OrbitControls(camera, renderer.domElement);

    // 全局光照
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0;
    scene.add(gridHelper);

    // 窗口自适应
    function handleResize () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance optimization
    }
    window.addEventListener('resize', handleResize);

    return { scene, camera, renderer, controls };
}