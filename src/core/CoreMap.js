import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';

class CoreMap {
    constructor(targetId, options) {
        this.targetId = targetId;
        this.options = options;
        this.initializeMap();
    }

    initializeMap() {
        this.map = new Map({
            target: this.targetId, // 目标元素的ID
            logo: false,
            loadTilesWhileAnimating: true,
            pixelRatio: 1,
            view: new View({
                center: [0, 0], // 地图初始中心点，使用EPSG:3857坐标
                zoom: 2, // 初始缩放级别
            }),
        });
        return this.map;
    }

    getMapInstance() {
        return this.map;
    }

    // 你可以在此类中添加更多的方法来扩展地图功能...
}

export default CoreMap;
