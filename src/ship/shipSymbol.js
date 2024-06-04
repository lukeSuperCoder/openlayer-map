import { Vector as VectorSource } from 'ol/source';
import { Layer, Vector as VectorLayer } from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON.js';
import WebGLPointsLayer from 'ol/layer/WebGLPoints.js';
import { transform } from 'ol/proj';
import Feature from 'ol/Feature.js';
import {Icon, Style} from 'ol/style.js';
import {Point} from 'ol/geom';
/**
 * 船位渲染类
 * @module ol/ship/shipSymbol
 */
const shipStyle = {
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

const shipDetailStyle = {
    'icon-src': './src/ship/shipModelDetail.svg', //采用精灵图片，所有模型整合到一张图片，根据偏移量调整船型
    //根据字段内容大小区间匹配
    'icon-offset': [0,0],
    'icon-width': [
        'interpolate',
        ['linear'],
        ['get', 'population'],
        40000,
        10 ,
        2000000,
        40 ,
    ],
    'icon-height': [
        'interpolate',
        ['linear'],
        ['get', 'population'],
        40000,
        40 ,
        2000000,
        70 ,
    ],
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
let areaShipLayer = null;
let areaShipDetailLayer = null;
let locateLayer = null;
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
        that.drawShipShape(data);
        that._map.on('click', (e) => {
            that._map.forEachFeatureAtPixel(e.pixel, (feature) => {
                that.locationShip(feature.getGeometry().getCoordinates())
            })
        })
    };

    //绘制船形
    drawShipShape(vectorData) {
        let that = this;

        const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(vectorData, {
                // 数据原始坐标系为EPSG:4326，目标坐标系为EPSG:3857
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            }),
            wrapX: true,
        });
        //绘制区域船（粗略船形）
        const preAreaShipLayer = areaShipLayer;
        areaShipLayer = new WebGLPointsLayer({
            source: vectorSource,
            style: shipStyle,
            maxZoom: 8,
            minZoom: 0
        });
        that._map.addLayer(areaShipLayer);

        if(preAreaShipLayer) {
            that._map.removeLayer(preAreaShipLayer);
            preAreaShipLayer.dispose();
        }

        //绘制区域船（精细船形）
        const preAreaShipDetailLayer = areaShipDetailLayer;
        areaShipDetailLayer = new WebGLPointsLayer({
            source: vectorSource,
            style: shipDetailStyle,
            maxZoom: 24,
            minZoom: 8
        });
        that._map.addLayer(areaShipDetailLayer);

        if(preAreaShipDetailLayer) {
            that._map.removeLayer(preAreaShipDetailLayer);
            preAreaShipDetailLayer.dispose();
        }

    };

    removeAreaShip() {
        let that = this;
        that._map.removeLayer(that.shipLayer);
        that.shipLayer.dispose();   // 释放资源（这一步必须要加，否则下次绘制会有问题）
    };

    //定位船
    locationShip(point) {
        let that = this;
        //地图定位和缩放
        // that._map.getView().setCenter(point);
        // that._map.getView().setZoom(14);
        that._map.getView().animate(14, {
            center: point,
            duration: 500
        });
        that.drawLocationBox(point);
    }
    //绘制定位框
    drawLocationBox(point) {
        let that = this;
        const iconFeature = new Feature({
            geometry: new Point(point),
            name: '定位框',
            type: '定位框',
            description: '定位框'
        })
        const iconStyle = new Style({
            image: new Icon({
                width: 50,
                height: 50,
                // offset: [-25, -25],
                src: './src/ship/locateBox.svg',
            })
        })
        iconFeature.setStyle(iconStyle);
        let vectorSource = new VectorSource({
            features: [iconFeature],
        });
        const preLocateLayer = locateLayer;
        locateLayer = new VectorLayer({
            source: vectorSource,
        });
        that._map.addLayer(locateLayer);
        if(preLocateLayer) {
            that._map.removeLayer(preLocateLayer);
        }
    }
}
export default ShipSymbol;
