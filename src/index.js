import 'ol/ol.css';
import CoreMap from './core/CoreMap';
import BaseMapManager from './mapManage/BaseMapManager';
import { transformExtent } from 'ol/proj'
import Track from './track/track';
import Ship from './ship/ship';


export class ElaneOlMap {
    constructor(targetId, options) {
        let that = this;
        that.options = {
            targetId: targetId,
            baseMapName: 'OSM',
            center: [116.397428, 39.90923],
            extent: transformExtent([-360, -90, 360, 90], "EPSG:4326", "EPSG:3857"),
            zoom: 4,
            minZoom:1,
            maxZoom: 18,
            projection: 'EPSG:3857'
        }
        that.options = Object.assign(that.options, options);
        // 创建CoreMap的实例
        this.coreMap = new CoreMap(targetId, that.options);
        if(this.coreMap.map) {
            // 初始化地图底图管理器
            this.mapInstance = this.coreMap.getMapInstance();
            this.baseMapManager = new BaseMapManager(this.coreMap.map, this.options);
            this.trackManager = new Track(this.coreMap.map, this.options);
            this.shipManager = new Ship(this.coreMap.map, this.options);
        }
    }
}

// 将 TestMap 暴露到全局作用域
window.ElaneOlMap = ElaneOlMap;