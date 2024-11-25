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
                // 设置位置
                object.position.set(0, 0, 0);
                // FIXME: 模型位置偏移

                object.traverse((child) => {
                    // console.log(child);

                    if (child.isMesh) {
                        child.startPosition = child.position.clone();
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

// ========== 地面类 ========== //
export class Floor {
    /**
    * @param size 尺寸
    * @param color 地砖颜色 HEX
    */
    constructor(size = 9, color = 0xffffff) {
        this.color = color;
        this.size = size;
        this.defaultY = -2;
        this.floortiles = this.createFloortiles(this.size, this.color);

        this.moveFloor(0);
    };

    createFloortiles (size, color) {
        const HALF_SIZE = Math.floor(size / 2);

        let floortiles = new THREE.Group();
        let floortilesCounter = 0;

        for (let i = -HALF_SIZE; i <= HALF_SIZE; i++)
            for (let j = -HALF_SIZE; j <= HALF_SIZE; j++) {
                let tile = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 0, 1), // 初始位置在水平以下
                    new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide })
                );

                tile.position.set(i, this.defaultY * 3, j);
                tile.manDis = Math.abs(i) + Math.abs(j);

                floortilesCounter++;
                floortiles.add(tile);
            }

        return floortiles;
    }

    /**
    * floor 的升降动画
    * @param direction 0-up, 1-down
    * @param depth 动画深度，一般用于下降 (this.defaultY)
    */
    moveFloor (direction, depth = this.defaultY) {
        if (direction === undefined) {

            console.error('Floor.moveFloor: "direction" is required.')
            return;
        }

        // 地砖升降动画
        this.floortiles.children.forEach(tile => {
            gsap.to(tile.position, {
                y: direction * (depth),
                duration: 1.0 / (0.8 * Global.guiSettings_get('animateRate')),
                ease: 'power2.inOut',
                delay: tile.manDis * 0.05
            });
        });

        // 轴线和网格
        let showAxes = Global.guiSettings_get('showAxes');
        let showGrid = Global.guiSettings_get('showGrid');
        let animateRate = Global.guiSettings_get('animateRate');

        if (showAxes) {
            gsap.to(axesHelper.position, {
                y: direction * (-2),
                duration: 1.0 / animateRate,
                ease: 'power2.inOut'
            });
        }

        if (showGrid) {
            const HALF_SIZE = Math.floor(this.size / 2);
            gsap.to(gridHelper.position, {
                y: direction * (-2),
                duration: 1.0 / animateRate,
                ease: 'power2.inOut'
            });
            gsap.to(gridHelper.material, {
                opacity: 1 - direction,
                duration: 1.0 / animateRate,
                ease: 'power2.inOut',
                delay: direction ? 0 : HALF_SIZE * HALF_SIZE * 0.05
            });
        }
    }
}
