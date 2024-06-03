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
        that._map.addLayer(iconsLayer);
    }
}
export default ShipSymbol;
