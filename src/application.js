// ==================== application.js ==================== //
// Describe: 核心功能实现
// ======================================================== //
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import gsap from 'gsap';

import * as Global from './global';

// ========== 初始化变量 ========== //
export var currentModel = null; // 当前模型
let basicScale = null; // 模型“标准”尺寸
const floorList = []; // 地面瓷砖（整个地面是由一片片瓷砖构成的，用于制作动画）

export const axesHelper = new THREE.AxesHelper(100); // 轴线
export const gridHelper = new THREE.GridHelper(11, 11); // 网格
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0;

// ========== 其他功能实现 ========== //
// 从文件夹获取模型列表
export async function initModelList () {
    const glob = import.meta.glob('/public/models/*');
    return Object.keys(glob)
        .map(filePath => filePath.split('/').pop())
        .filter(fileName => {
            const extension = fileName.toLowerCase().split('.').pop();
            return extension === 'glb' || extension === 'gltf';
        });
}

// 根据 gui 设置更新模型尺寸
export function updateModelScale (newModelScale) {
    const newScale = newModelScale * basicScale;
    currentModel.scale.set(newScale, newScale, newScale);
}

// ========== 场景功能实现 ========== //
// 初始化场景
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

// ========== 地板功能实现 ========== //
// 初始化地板
export async function initFloor (scene, color = 0xffffff) {
    const STARTPOSITION = -4;
    let floorCount = 0;

    for (let i = STARTPOSITION; i <= -STARTPOSITION; i++) {
        for (let j = STARTPOSITION; j <= -STARTPOSITION; j++) {
            const floor = await createFloorTile(color);
            floor.material.transparent = true;
            floor.material.opacity = 0;

            floor.position.x = i;
            floor.position.z = j;
            floor.manDis = Math.abs(i) + Math.abs(j);

            floorList.push(floor);
            scene.add(floor);
            floorCount++;

        }
    }

    // 渐变入场
    if (floorCount === 81) {
        floorList.forEach(floor => {
            gsap.to(floor.material, {
                opacity: 1,
                duration: 1.0 / (0.8 * Global.guiSettings_get('animateRate')),
                ease: 'power2.inOut',
                delay: floor.manDis * 0.05
            })
        })
    }

    moveFloor(0);

    // 创建地面
    async function createFloorTile (color) {
        return new Promise((resolve) => {
            let floor = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 0),
                new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide })
            );
            floor.position.y = -5;
            floor.rotation.x = Math.PI / 2;
            resolve(floor);
        })
    }
}

/**
 * floor 的升降动画
 * @param state 0-rising, 1-falling
 */
export function moveFloor (state) {
    // 每块瓷砖的动画 升降和材质
    floorList.forEach(floor => {
        gsap.to(floor.position, {
            y: state * (-2),
            duration: 1.0 / (0.8 * Global.guiSettings_get('animateRate')),
            ease: 'power2.inOut',
            delay: floor.manDis * 0.05
        });
    });

    // 轴线和网格
    let showAxes = Global.guiSettings_get('showAxes');
    let showGrid = Global.guiSettings_get('showGrid');
    let animateRate = Global.guiSettings_get('animateRate');

    if (showAxes) {
        gsap.to(axesHelper.position, {
            y: state * (-2),
            duration: 1.0 / animateRate,
            ease: 'power2.inOut'
        });
    }

    if (showGrid) {
        gsap.to(gridHelper.position, {
            y: state * (-2),
            duration: 1.0 / animateRate,
            ease: 'power2.inOut'
        });
        gsap.to(gridHelper.material, {
            opacity: 1 - state,
            duration: 1.0 / animateRate,
            ease: 'power2.inOut',
            delay: state ? 0 : 4 * 4 * 0.05
        });
    }
}

// ========== 模型功能实现 ========== //
/**
 * 加载指定模型
 * @param scene 主场景 scene
 * @param modelName 选择载入的模型（modelList 中选中的）
 */
export async function loadModel (scene, modelName) {
    // 清理当前模型
    if (currentModel) { scene.remove(currentModel); }

    // 加载进度条
    const progressPoints = [33, 67, 100];
    let progressPtIndex = 0;

    const MANAGER = new THREE.LoadingManager();

    const DRACO_LOADER = new DRACOLoader(MANAGER)
        .setDecoderPath('/node_modules/three/examples/jsm/libs/draco/')
        .setDecoderConfig({ type: 'js' })
        .preload();
    const KTX2_LOADER = new KTX2Loader(MANAGER)
        .setTranscoderPath('/node_modules/three/examples/jsm/libs/basis');

    const loader = new GLTFLoader(MANAGER)
        .setCrossOrigin('anonymous')
        .setDRACOLoader(DRACO_LOADER)
        .setKTX2Loader(KTX2_LOADER.detectSupport(new THREE.WebGLRenderer({ antialias: true })))
        .setMeshoptDecoder(MeshoptDecoder);
    loader.setPath('/models/');

    loader.load(
        // NOTE: gltf-pipeline -i path/to/input.glb -o path.to/output.glb --draco.compressMeshes
        modelName,
        (gltf) => {
            // NOTE: 这部分参考了 donmccurdy/three-gltf-viewer/src/viewer.js
            const modelScene = gltf.scene || gltf.scenes[0];
            const clips = gltf.animations || [];

            setContent(modelScene, clips);

            // FIXME: 光照问题
            function setContent (object, clips) {
                object.updateMatrixWorld(true);

                const box = new THREE.Box3().setFromObject(object);
                const center = box.getCenter(new THREE.Vector3());

                // 设置位置
                object.position.set(0, 0, 0);
                // object.position.x -= center.x;
                // object.position.y -= center.y;
                // object.position.z -= center.z;

                object.traverse((child) => {
                    if (child.isMesh) {
                        const worldPosition = child.getWorldPosition(new THREE.Vector3());
                        child.startPosition = worldPosition.clone();
                    }
                    if (child.material) {
                        child.material.transparent = true;
                        child.material.opacity = 0;
                    }
                });

                // 获取预计尺寸
                const size = new THREE.Vector3();
                new THREE.Box3().setFromObject(object).getSize(size);
                const maxSize = Math.max(size.x, size.y, size.z);
                basicScale = maxSize >= 1 ? 1.0 : (maxSize >= 0.5 ? 1.0 / maxSize : 2 * 1.0 / maxSize);

                let modelScale = Global.guiSettings_get('modelScale');
                object.scale.set(modelScale * basicScale, modelScale * basicScale, modelScale * basicScale);

                scene.add(object);

                currentModel = object;

                object.traverse((child) => {
                    if (child.isMesh && child.material) {
                        gsap.to(child.material, {
                            opacity: 1,
                            duration: 1,
                            ease: 'power2.inOut'
                        });
                    }
                });
            }
        },
        // TODO: 模型较大，所以需要进度反馈，后期写到主屏幕上
        // NOTE: 也许模型也没那么大？可以考虑直接改掉吧
        (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            while (progressPtIndex < progressPoints.length &&
                percentage >= progressPoints[progressPtIndex]) {
                console.log(`Loading model ${modelName}: ${percentage.toFixed(2)}%`);
                progressPtIndex++;
            }
        },
        (error) => { console.error('Error loading model:', modelName, error); }
    );
}

// 模型分解（爆炸图）
export function disassembleModel (model = currentModel, random = true) {
    const distance = random
        ? (() => Math.random() > 0.5 ? 1.5 : -1.5) // 随机生成目标距离
        : (() => 1.0) // TODO:定向拆解 // WARN: 未启用

    model.traverse((child) => {
        if (child.startPosition) {
            const vector = [distance(), distance(), distance()]
            gsap.to(child.position, {
                x: child.startPosition.x + vector[0] / basicScale,
                y: child.startPosition.y + vector[1] / basicScale,
                z: child.startPosition.z + vector[2] / basicScale,
                duration: 1.0 / Global.guiSettings_get('animateRate'),
                ease: 'power2.inOut'
            })
        }
    });
}

// 模型合并（爆炸图）
export function mergeModel (model = currentModel) {
    model.traverse((child) => {
        if (child.startPosition) {
            gsap.to(child.position, {
                x: child.startPosition.x,
                y: child.startPosition.y,
                z: child.startPosition.z,
                duration: 1.0 / Global.guiSettings_get('animateRate'),
                ease: 'power2.inOut'
            });
        }
    });
}
// FIXME: 修复模型合并时候位置错误（变回了加载错误时的位置）