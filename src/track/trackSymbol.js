import { Vector as VectorSource } from 'ol/source';
import { Layer, Vector as VectorLayer } from 'ol/layer';
import { LineString } from 'ol/geom';
import GeoJSON from 'ol/format/GeoJSON.js';
import WebGLPointsLayer from 'ol/layer/WebGLPoints.js';
import WebGLVectorLayerRenderer from 'ol/renderer/webgl/VectorLayer.js';
import { transform } from 'ol/proj';

let style = null;
class WebGLLayer extends Layer {
    createRenderer() {
        return new WebGLVectorLayerRenderer(this, {
            className: this.getClassName(),
            style
        });
    }
}

const predefinedStyles = {
    icons: {
        'icon-src': './src/track/track_stop.png',
        'icon-width': 18,
        'icon-height': 28,
        // 'icon-color': 'lightyellow',
        'icon-rotate-with-view': false,
        'icon-displacement': [0, 9],
    },
    circles: {
      'circle-radius': 5,
      'circle-fill-color': ['match', ['get', 'hover'], 1, '#ff3f3f', '#006688'],
      'circle-rotate-with-view': false,
      'circle-displacement': [0, 0],
      'circle-opacity': 1,
    }
};

  const getStyle = (dash, pattern) => {
    let newStyle = {
      variables: style
        ? style.variables
        : {
            width: 1,
            offset: 0,
            capType: 'butt',
            joinType: 'miter',
            miterLimit: 10, // ratio
            dashLength1: 25,
            dashLength2: 15,
            dashLength3: 15,
            dashLength4: 15,
            dashOffset: 0,
            patternSpacing: 0,
          },
      'stroke-width': ['var', 'width'],
      'stroke-color': 'rgba(24,86,34,0.7)',
      'stroke-offset': ['var', 'offset'],
      'stroke-miter-limit': ['var', 'miterLimit'],
      'stroke-line-cap': ['var', 'capType'],
      'stroke-line-join': ['var', 'joinType'],
    };
    return newStyle;
  };
  
  style = getStyle(false, false);
/**
 * 轨迹渲染类
 * @module TrackSymbol
 */
class TrackSymbol {
    constructor(mapInstance, options) {
        let that = this;
        this._map = mapInstance;
        this.options = {

        }
        that.options = Object.assign(that.options, options);
    };

    //展示轨迹
    showTrack(trackData) {
        let that = this;
        const vectorData = that.transFormGeoJson(trackData, 'EPSG:4326', 'EPSG:3857')
        that.drawTrackPoint(vectorData);
        that.drawTrackLine(vectorData);
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
    //点位转换成线段
    getLineFromPoint(geojson) {
        let coordinates = [];
        geojson.features.forEach(feature => {
            if (feature.geometry.type === "Point") {
                coordinates.push(feature.geometry.coordinates);
            }
        });
        const geojsonFormat = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": coordinates
                    }
                }
            ]
        };
        return geojsonFormat;
    };
    //绘制轨迹点
    drawTrackPoint(vectorData) {
        let that = this;
        const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(vectorData),
            wrapX: true,
        });
        const pointsLayer = new WebGLPointsLayer({
            source: vectorSource,
            style: predefinedStyles['circles']
        });
        that._map.addLayer(pointsLayer);

        const iconsLayer = new WebGLPointsLayer({
            source: vectorSource,
            style: predefinedStyles['icons']
        });
        that._map.addLayer(iconsLayer);
    };
    //绘制轨迹线
    drawTrackLine(vectorData) {
        let that = this;
        const lineData = that.getLineFromPoint(vectorData);
        const lineSource = new VectorSource({
            features: new GeoJSON().readFeatures(lineData),
            wrapX: true,
        });
        const lineLayer = new WebGLLayer({
            source: lineSource,
        });
        that._map.addLayer(lineLayer);
    }
}
export default TrackSymbol;