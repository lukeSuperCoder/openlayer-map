import ElaneOlMap from '../src/index.js';


// 通过new操作符实例化TestMap类，并指定ID为'map'的元素为地图容器
let options = {
    targetId: 'map',
    baseMapName: 'OSM'
}
console.log(ElaneOlMap);
const elaneMap = new window.ElaneOlMap('map',options);
window.elaneMap = elaneMap;

// 将 TestMap 暴露到全局作用域
window.ElaneOlMap = ElaneOlMap;