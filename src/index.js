import 'ol/ol.css';
import CoreMap from './core/CoreMap';
import BaseMapManager from './mapManage/BaseMapManager';


export class ElaneOlMap {
    constructor(targetId, options) {
        // 创建CoreMap的实例
        this.coreMap = new CoreMap(targetId, options);
        if(this.coreMap.map) {
            // 初始化地图底图管理器
            this.mapInstance = this.coreMap.getMapInstance();
            this.baseMapManager = new BaseMapManager(this.coreMap.map);
        }
    }
}

// 将 TestMap 暴露到全局作用域
window.ElaneOlMap = ElaneOlMap;