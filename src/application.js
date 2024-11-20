// ==================== application.js ==================== //
// Describe: 核心功能实现
// ======================================================== //
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

import * as Global from './global';
import * as Scene from './scene';

// ========== 初始化变量 ========== //
export var currentModel = null; // 当前模型
let basicScale = null; // 模型“标准”尺寸
const floorList = []; // 地面瓷砖（整个地面是由一片片瓷砖构成的，用于制作动画）

const axesHelper = Scene.axesHelper; // 轴线 
const gridHelper = Scene.gridHelper; // 网格
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0;

// ========== 其他功能实现 ========== //
// 从文件夹获取模型列表
export async function initModelList () {
    const glob = import.meta.glob('/public/models/*');
    return Object.keys(glob).map(filePath => filePath.split('/').pop());
}

// 根据 gui 设置更新模型尺寸
export function updateModelScale (newModelScale) {
    const newScale = newModelScale * basicScale;
    currentModel.scale.set(newScale, newScale, newScale);
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
        gsap.to(Scene.axesHelper.position, {
            y: state * (-2),
            duration: 1.0 / animateRate,
            ease: 'power2.inOut'
        });
    }

    if (showGrid) {
        gsap.to(Scene.gridHelper.position, {
            y: state * (-2),
            duration: 1.0 / animateRate,
            ease: 'power2.inOut'
        });
        gsap.to(Scene.gridHelper.material, {
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
    if (currentModel) { scene.remove(currentModel); } // 清理当前模型

    const loader = new DRACOLoader();
    loader.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/');
    loader.setDecoderConfig({ type: 'js' });
    loader.preload();

    const gltfLoader = new GLTFLoader().setDRACOLoader(loader);
    gltfLoader.setPath('/public/models/');

    gltfLoader.load(
        // NOTE: gltf-pipeline -i path/to/input.glb -o path.to/output.glb --draco.compressMeshes
        modelName,
        (gltf) => {
            currentModel = gltf.scene;
            currentModel.position.set(0, 0, 0);
            currentModel.transparent = true;
            currentModel.traverse((child) => {
                if (child.isMesh) {
                    child.localToWorld(child.position);
                    child.startPosition = child.position.clone();
                }
                if (child.material) {
                    child.material.transparent = true;
                    child.material.opacity = 0;
                }
            });

            // 获取预计尺寸
            const size = new THREE.Vector3();
            new THREE.Box3().setFromObject(currentModel).getSize(size);
            const maxSize = Math.max(size.x, size.y, size.z);
            basicScale = maxSize >= 1 ? 1.0 : (maxSize >= 0.5 ? 1.0 / maxSize : 2 * 1.0 / maxSize); // 简单的算法计算预计尺寸

            let modelScale = Global.guiSettings_get('modelScale');
            currentModel.scale.set(modelScale * basicScale, modelScale * basicScale, modelScale * basicScale); // 调整尺寸

            scene.add(currentModel);
            currentModel.traverse((child) => {
                if (child.isMesh && child.material) {
                    gsap.to(child.material, {
                        opacity: 1,
                        duration: 1,
                        ease: 'power2.inOut'
                    });
                }
            })
        },
        // TODO: 模型较大，所以需要进度反馈，后期写到主屏幕上
        // TODO: 会输出一堆消息，减少输出量
        (progress) => { console.log(`Loading model`, modelName, `: ${((progress.loaded / progress.total) * 100).toFixed(2)}%`); },
        (error) => { console.error('Error loading model`, modelName, `:', error); }
    );
};

// 模型分解（爆炸图）
export function disassembleModel (model = currentModel, random = true) {
    const distance = random
        ? (() => Math.random() > 0.5 ? 1.5 : -1.5)
        : (() => 1.0) // WARN: 未启用
    //TODO:定向拆解
    model.traverse((child) => {
        if (child.startPosition) {
            const vector = [distance(), distance(), distance()] // 随机生成目标距离
            gsap.to(child.position, {
                x: child.startPosition.x + vector[0] / basicScale,
                y: child.startPosition.y + vector[1] / basicScale,
                z: child.startPosition.z + vector[2] / basicScale,
                duration: 1.0 / Global.guiSettings_get('animateRate'),
                ease: 'power2.inOut'
            })
        }
    });




    // model.traverse((child) => {
    //     if (child.startPosition) {
    //         const vector = [distance(), distance(), distance()];
    //         gsap.to(child.position, {
    //             x: child.startPosition.x + vector[0] / basicScale,
    //             y: child.startPosition.y + vector[1] / basicScale,
    //             z: child.startPosition.z + vector[2] / basicScale,
    //             duration: 1.0 / Global.guiSettings_get('animateRate'),
    //             ease: 'power2.inOut'
    //         });
    //     }
    // });
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