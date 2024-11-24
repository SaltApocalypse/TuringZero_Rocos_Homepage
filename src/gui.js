// ==================== gui.js ==================== //
// Describe: GUI实现
// ================================================ //
import * as dat from 'dat.gui';

import * as App from './application';
import * as Global from './global';

// ========== 初始化 GUI 界面 ========== //
export async function initGUI (scene) {
    const gui = new dat.GUI();

    // ========== 场景配置 ========== //
    const sceneFolder = gui.addFolder('Scene');

    sceneFolder.add(Global._guiSettings, 'showAxes').onChange(() => {
        let showAxes = Global.guiSettings_get('showAxes');
        let axesHelper = App.axesHelper;
        if (showAxes) { scene.add(axesHelper); } else { scene.remove(axesHelper); }
    });

    sceneFolder.add(Global._guiSettings, 'showGrid').onChange(() => {
        let showGrid = Global.guiSettings_get('showGrid');
        let gridHelper = App.gridHelper;
        if (showGrid) { scene.add(gridHelper); } else { scene.remove(gridHelper); }
    });

    sceneFolder.open();

    // ========== 模型配置 ==========
    const modelFolder = gui.addFolder('Model');
    // 模型选择
    modelFolder.add(Global._guiSettings, 'model', Global.modelList_get())
        .name('Choose Model')
        .onChange(() => {
            App.loadModel(scene, Global.guiSettings_get('model'), refreshList());
        });
    // 模型尺寸
    modelFolder.add(Global._guiSettings, 'modelScale', 0.5, 2, 0.1)
        .name("Model Scale")
        .onChange(() => {
            App.updateModelScale(Global.guiSettings_get('modelScale'));
        });
    // 动画速率
    modelFolder.add(Global._guiSettings, 'animateRate', 0.5, 2, 0.1)
        .name("Animate Rate");

    // 模型拆解
    modelFolder.add({
        'Disassembletake': () => {
            App.disassembleModel();
            App.moveFloor(1);
        }
    }, 'Disassembletake');

    // 模型合并
    modelFolder.add({
        'Merging': () => {
            App.mergeModel();
            App.moveFloor(0);
        }
    }, 'Merging');

    modelFolder.open();
}

// ========== 其他函数 ========== //
// 重载后保留目前数值
function refreshList () {
    return [Global.guiSettings_get('modelScale'), Global.guiSettings_get('animateRate')];
}