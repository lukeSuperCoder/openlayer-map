import { Vector as VectorSource } from 'ol/source';
import { Layer, Vector as VectorLayer } from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON.js';
import WebGLPointsLayer from 'ol/layer/WebGLPoints.js';
import { transform } from 'ol/proj';
/**
 * 船位渲染类
 * @module ol/ship/shipSymbol
 */
class ShipSymbol {
    constructor(mapInstance, options) {
        let that = this;
        this._map = mapInstance;
        this.options = {

        }
        that.options = Object.assign(that.options, options);
    }
    
    drawAreaShip(data) {
        let that = this;
        const vectorData = that.transFormGeoJson(data, 'EPSG:4326', 'EPSG:3857');
        that.drawShipShape(vectorData);
    };

    //GeoJSON对象坐标系转换
    transFormGeoJson(geojson, projFrom, projTo) {
        // 遍历GeoJSON对象，转换每个坐标
        geojson.features.forEach(feature => {
            if (feature.geometry.type === "Point") {
                feature.geometry.coordinates = transform(feature.geometry.coordinates, projFrom, projTo);
            } else if (feature.geometry.type === "LineString" || feature.geometry.type === "MultiPoint") {
                feature.geometry.coordinates = feature.geometry.coordinates.map(coord => transform(coord,  projFrom, projTo));
            } else if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiLineString") {
                feature.geometry.coordinates = feature.geometry.coordinates.map(ring => ring.map(coord => transform(coord,  projFrom, projTo)));
            } else if (feature.geometry.type === "MultiPolygon") {
                feature.geometry.coordinates = feature.geometry.coordinates.map(polygon => polygon.map(ring => ring.map(coord => transform(coord,  projFrom, projTo))));
            }
        });
        return geojson;
    };

    //绘制船形
    drawShipShape(vectorData) {
        let that = this;
        if(that.shipLayer) {
            that.removeAreaShip();
        }
        const iconStyle = {
            'icon-src': './src/ship/shipModel.svg', //采用精灵图片，所有模型整合到一张图片，根据偏移量调整船型
            //根据字段内容大小区间匹配
            'icon-offset': [
                'case',
                ['<', ['get', 'population'], 100000], [0,0],     // population < 10000
                ['<', ['get', 'population'], 1000000], [50,0],    // 10000 <= population < 50000
                ['>=', ['get', 'population'], 1000000], [150,0],    // population >= 100000
                [0,0]
            ],
            //根据字段内容匹配
            // 'icon-offset': [
            //     'match',
            //     ['get', 'region'],
            //     '01',
            //     [100, 0],
            //     '02',
            //     [150, 0],
            //     '03',
            //     [50, 0],
            //     [0, 0],
            // ],
            'icon-size': [50, 50],
            'icon-width': 200,
            'icon-height': 50,
            'icon-color': 'red',
            'icon-rotate-with-view': false,
            'icon-displacement': [0, 9],
            'icon-rotation': [
                'interpolate',
                ['linear'],
                ['get', 'population'],
                40000,
                1 ,
                2000000,
                100 ,
            ],
        }

        const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(vectorData),
            wrapX: true,
        });

        const iconsLayer = new WebGLPointsLayer({
            source: vectorSource,
            style: iconStyle
        });

        that.shipLayer = iconsLayer;
        that._map.addLayer(that.shipLayer);
    };
    drawShipShape1(vectorData) {
        let that = this;
        if(that.shipLayer) {
            that.removeAreaShip();
        }
        const iconStyle = {
            'icon-src': './src/ship/shipShape.svg',
            'icon-width': 30,
            'icon-height': 30,
            'icon-color': 'red',
            'icon-rotate-with-view': false,
            'icon-displacement': [0, 9],
            'icon-rotation': [
                'interpolate',
                ['linear'],
                ['get', 'population'],
                40000,
                1 ,
                2000000,
                100 ,
            ],
        }

        const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(vectorData),
            wrapX: true,
        });

        const iconsLayer = new WebGLPointsLayer({
            source: vectorSource,
            style: iconStyle
        });

        that.shipLayer = iconsLayer;
        that._map.addLayer(that.shipLayer);
    };

    removeAreaShip() {
        let that = this;
        that._map.removeLayer(that.shipLayer);
        that.shipLayer.dispose();   // 释放资源（这一步必须要加，否则下次绘制会有问题）
    };
}
export default ShipSymbol;
