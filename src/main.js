// ==================== main.js ==================== //
// Describe: 主函数
// ================================================= //
import * as APP from './application';

export const DEBUG_MODE = true;
// export const DEBUG_MODE = false;

async function main () {
    // 场景定义
    const { scene, camera, renderer, controls } = new APP.Scene();

    // 地板初始化
    const floor = new APP.Floor();
    scene.add(floor.floortiles)

    // 模型初始化
    const model = new APP.Model();
    if (model.modelList != [])
        model.loadModel(scene, model.modelList[0]);

    // 动画循环
    function animate () {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
    }
    animate();

    // 监听：窗口变化
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    main();
});
