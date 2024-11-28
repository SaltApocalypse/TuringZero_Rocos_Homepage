// ==================== application.js ==================== //
// Describe: 核心功能实现
// ======================================================== //
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import GSAP from 'gsap';

import { DEBUG_MODE } from './main';
import * as DEBUG from './debug';

// ========== 场景类 ========== //
export class Scene {
    /**
     * 生成场景
     * @returns {*} scene, camera, renderer, controls
     */
    constructor() {
        this.name = "Class.Scene"; // 标记
        // 相机
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(5, 5, 5);
        // 场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#6588D7');
        this.scene.add(this.camera);
        // 渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // 鼠标控制
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // 装进 canvas-container 内
        const container = document.getElementById('canvas-container');
        container.appendChild(this.renderer.domElement);

        // 全局光照
        const ambientLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(ambientLight);

        if (DEBUG_MODE) {
            DEBUG.DEBUG_TEST(this.scene, this.camera);
        }

        return { scene: this.scene, camera: this.camera, renderer: this.renderer, controls: this.controls };
    }
}

// ========== 模型类 ========== //
export class Model {
    constructor() {
        this.name = "Class.Model"; // 标记
        this.modelList = this.getModelList();
        this.model = null;
    }

    /**
     * 获取目标文件夹内所有可使用的模型
     * @returns {list} 模型列表，如果没有则返回空列表
     */
    getModelList () {
        try {
            const glob = import.meta.glob('/public/models/*');
            return Object.keys(glob)
                .map(filePath => filePath.split('/').pop())
                .filter(fileName => {
                    const extension = fileName.toLowerCase().split('.').pop();
                    return extension === 'glb' || extension === 'gltf';
                });
        } catch (error) {
            console.error(this.name, 'Error loading model list:', error);
            return [];
        }
    }

    /**
     * 把指定模型载入到场景中
     * @param {THREE.Scene} scene
     * @param {string} modelName 来自 this.modelList 的模型名称
     * @returns {*} 0 if succeed.
     */
    loadModel (scene, modelName) {
        if (!scene || !modelName) { console.error("Function missing parameter(s)."); }
        // 清理当前模型
        if (this.model) { scene.remove(scene.getChildrenByName("currentModel")); } // NOTE: 定义所有加载的模型的名称都为 currentModel

        // 加载进度条
        let progressPtIndex = 0;
        const progressPoints = [33, 67, 100];

        // 模型加载器
        // NOTE: 这部分参考了 https://github.com/donmccurdy/three-gltf-viewer/blob/main/src/viewer.js
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

        loader.load( // FIXME: Cannot read properties of undefined (reading 'lastIndexOf')
        // NOTE: gltf-pipeline -i path/to/input.glb -o path.to/output.glb --draco.compressMeshes
            modelName,
            (gltf) => {
                // FIXME: 存在光照缺少导致不清楚的问题
                // NOTE: 可以通过平行光等进行补充修复，等场景内完成后再撤掉 FIXME
                this.model = gltf.scene || gltf.scenes[0];
                this.model.name = "currentModel";

                this.model.position.set(0, 0, 0);

                // 载入动画准备
                this.model.traverse((child) => {
                    if (child.material) {
                        child.material.transparent = true;
                        child.material.opacity = 0;
                    }
                });

                // 载入动画
                this.model.traverse((child) => {
                    if (child.isMesh && child.material) {
                        GSAP.to(child.material, {
                            opacity: 1,
                            duration: 1,
                            ease: 'power2.inOut'
                        });
                    }
                });

                scene.add(this.model);
            },
            // TODO: 模型较大，所以需要进度反馈，后期写到主屏幕上
            // NOTE: 也许模型也没那么大？可以考虑直接改掉吧
            (progress) => {
                const percentage = (progress.loaded / progress.total) * 100;
                while (progressPtIndex < progressPoints.length &&
                    percentage >= progressPoints[progressPtIndex]) {
                    console.log(this.name, `: Loading model ${modelName}: ${percentage.toFixed(2)}%`);
                    progressPtIndex++;
                }
            },
            (error) => { console.error('Error loading model:', modelName, error); }
        );
    }
}

// ========== 地面类 ========== //
export class Floor {
    /**
     * 地面类 
     * @param {int} size 尺寸
     * @param {hex} color 地砖颜色
     */
    constructor(size = 9, color = 0xffffff) {
        this.name = "Class.Floor"; // 标记
        this.color = color;
        this.size = size;
        this.defaultY = -2;
        this.floortiles = this.createFloortiles(this.size, this.color);

        this.moveFloor(0);
    };

    /**
     * 构建每块地砖 
     * @param {int} size 尺寸
     * @param {hex} color 地砖颜色
     * @returns {THREE.Group} 一组地砖
     */
    createFloortiles (size, color) {
        if (!size || !color) { console.error("Function missing parameter(s)."); }

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
    * @param {int} direction 0-up, 1-down
    * @param {int} depth 动画深度，一般用于下降 (this.defaultY)
    */
    moveFloor (direction, depth = this.defaultY) {
        if (direction == null) {
            console.error("Function missing parameter(s).");
            return;
        }

        // 地砖升降动画
        this.floortiles.children.forEach(tile => {
            GSAP.to(tile.position, {
                y: direction * (depth),
                duration: 1.0,
                ease: 'power2.inOut',
                delay: tile.manDis * 0.05
            });
        });
    }
}
