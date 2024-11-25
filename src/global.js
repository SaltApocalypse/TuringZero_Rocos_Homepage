// ==================== global.js ==================== //
// Describe: 该文件用于存放全局变量
// =================================================== //

// ========== 地面及其操作 ========== //
let _floor = null;
export function floor_get () { return _floor; }
export function floor_set (input) { _floor = input; }

// ========== 模型列表及其操作 ========== //
let _modelList = null;
export function modelList_get () { return _modelList; }
export function modelList_set (input = []) { _modelList = input; }
export function modelList_getLength () { return _modelList.length; }

// ========== gui设置及其操作 ========== //
// WARN: 这里打上 export 是为了让 GUI.add 方法能获取对象
// 请不要直接在别处直接用 _guiSettings 修改，提供了 get/set 方法
export let _guiSettings = {
    showAxes: false,
    showGrid: true,
    animateRate: 1.0,
    modelScale: 1.0,
    model: null,
};

export function guiSettings_get (key = null) {
    if (key) { return _guiSettings[key]; }
    return _guiSettings;
}

export function guiSettings_set (key, value = null) {
    if (typeof key === 'object' && value === null) { _guiSettings = { ..._guiSettings, ...key }; }
    else if (key in _guiSettings) { _guiSettings[key] = value; }
    else { throw new Error(`Invalid key: ${key}`); }
}