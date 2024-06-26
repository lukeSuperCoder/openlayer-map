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
        // 'icon-scale': [1,0.5],
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
        that.initTrack();
    };
    //初始化轨迹
    initTrack() {
        /**
         *  初始化数据源
         */

        //绘制轨迹线数据源
        that.trackLineSource = new VectorSource({
            features: []
        });
        //绘制轨迹点数据源
        that.trackPointSource = new VectorSource({
            features: []
        });

        /**
         *  初始化图层
         */
        //绘制轨迹线图层
        that.trackLineLayer = new VectorLayer({
            source: that.trackLineSource,
            // style: style
        });
        //绘制轨迹点图层
        that.trackPointLayer = new WebGLLayer({
            source: that.trackPointSource,
            // style: style
        });

    };
    //展示轨迹
    showTrack(trackData) {
        let that = this;
        that.drawTrackPoint(trackData);
        that.drawTrackLine(trackData);
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
            features: new GeoJSON().readFeatures(vectorData, {
                // 数据原始坐标系为EPSG:4326，目标坐标系为EPSG:3857
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            }),
            wrapX: false,
        });
        const pointsLayer = new VectorLayer({
            source: vectorSource,
            // style: predefinedStyles['circles']
        });
        that._map.addLayer(pointsLayer);

        const iconsLayer = new VectorLayer({
            source: vectorSource,
            // style: predefinedStyles['icons']
        });
        that._map.addLayer(iconsLayer);
    };
    //绘制轨迹线
    drawTrackLine(vectorData) {
        let that = this;
        const lineData = that.getLineFromPoint(vectorData);
        const lineSource = new VectorSource({
            features: new GeoJSON().readFeatures(lineData, {
                // 数据原始坐标系为EPSG:4326，目标坐标系为EPSG:3857
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            }),
            wrapX: true,
        });
        const lineLayer = new WebGLLayer({
            source: lineSource,
        });
        that._map.addLayer(lineLayer);
    }
}
export default TrackSymbol;