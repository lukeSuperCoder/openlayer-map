/**
 * 轨迹播放渲染类
 * @module TrackPlaySymbol
 */
import Feature from 'ol/Feature.js';
import GeoJSON from 'ol/format/GeoJSON';
import Point from 'ol/geom/Point.js';
import Polyline from 'ol/format/Polyline.js';
import { LineString } from 'ol/geom';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import {
    Circle as CircleStyle,
    Fill,
    Icon,
    Stroke,
    Style,
} from 'ol/style.js';
import {
    Tile as TileLayer,
    Vector as VectorLayer
} from 'ol/layer.js';
import {
    getVectorContext
} from 'ol/render.js';
const styles = {
    'route': new Style({
        stroke: new Stroke({
            width: 2,
            color: 'red',
        }),
    }),
    'geoMarker': new Style({
        image: new Icon({
            anchor: [0.5, 0.5],
            src: './src/track/shipModel.svg',
            rotation: 45,
            color:'yellow',
            scale: 0.8,
        }),
    }),
};
let self = null;    // 用来保存this
class TrackPlaySymbol {
    constructor(mapInstance, options) {
        let that = this;
        this._map = mapInstance;
        this.options = {

        }
        that.options = Object.assign(that.options, options);
        that.timeline = null;
        that.playPauseButton = null;
        that.playSpeedButton = null;
        that.trackDataSource = null;
        that.trackMarkerSource = null;
        that.trackMarkerPosition = null;
        that.trackPlayLayer = null;
        that.animating = false;
        that.distance = 0;
        that.lastTime = 0;
        that.eventInstance = null;
        that.playSpeed = 1;
        self = that;
    }
    createTimelineUI() {
        // 创建时间轴
        this.timeline = document.createElement('input');
        this.timeline.type = 'range';
        this.timeline.min = 0;
        this.timeline.max = 100;
        this.timeline.value = 0;
        this.timeline.style.width = '50%';
        this.timeline.style.position = 'absolute';
        this.timeline.style.top = '80px';
        document.body.appendChild(this.timeline);
    
        // 创建播放/暂停按钮
        this.playPauseButton = document.createElement('button');
        this.playPauseButton.innerText = 'Play';
        this.playPauseButton.style.position = 'absolute';
        this.playPauseButton.style.top = '100px';
        document.body.appendChild(this.playPauseButton);

        // 创建播放速度调节按钮
        this.playSpeedButton = document.createElement('button');
        this.playSpeedButton.innerText = 'Speed: '+this.playSpeed+'x';
        this.playSpeedButton.style.position = 'absolute';
        this.playSpeedButton.style.top = '100px';
        this.playSpeedButton.style.left = '50px';
        document.body.appendChild(this.playSpeedButton);
    }
    
    setupEventListeners() {
        // 播放/暂停按钮的点击事件
        this.playPauseButton.addEventListener('click', () => {
          if (this.animating) {
            this.stopAnimation();
          } else {
            this.startAnimation();
          }
        });
    
        // 时间轴变化的事件
        this.timeline.addEventListener('input', () => {
            const timelineValue = this.timeline.value / 100; // 将时间轴值转换为0到1之间
            this.distance = timelineValue; // 更新 distance
            this.lastTime = Date.now(); // 重置 lastTime
        //   this.currentIndex = Math.floor(this.coordinates.length * (this.timeline.value / 100));
            this.updateMarkerPosition();
        //   this.onTimeUpdate(this.currentIndex); // 调用时间更新回调
        });

        //速度切换
        this.playSpeedButton.addEventListener('click', () => {
            if (this.playSpeed === 1) {
                this.playSpeed = 2;
            } else if (this.playSpeed === 2) {
                this.playSpeed = 4;
            } else if (this.playSpeed === 4) {
                this.playSpeed = 10;
            } else if (this.playSpeed === 10) {
                this.playSpeed = 1;
            }
            this.playSpeedButton.innerText = 'Speed: '+this.playSpeed+'x';
        })
    }
    //添加轨迹
    addTrack(trackData) {
        let that = this;
        that.createTimelineUI();
        that.setupEventListeners();
        that.trackDataSource = new LineString(trackData);
        that.trackDataSource.transform('EPSG:4326', 'EPSG:3857');   //4326转3857
        //创建轨迹数据源
        const trackDataFeature = new Feature({
            type: 'route',
            geometry: that.trackDataSource,
        });
        //创建起点标记
        const startMarker = new Feature({
            type: 'icon',
            geometry: new Point(that.trackDataSource.getFirstCoordinate()),
        });
        that.trackMarkerPosition = startMarker.getGeometry().clone();
        //创建标记源
        that.trackMarkerSource = new Feature({
            type: 'geoMarker',
            geometry: that.trackMarkerPosition,
        });
        //创建轨迹播放图层
        that.trackPlayLayer = new VectorLayer({
            source: new VectorSource({
                features: [trackDataFeature, that.trackMarkerSource],
            }),
            style: function (feature) {
                return styles[feature.get('type')];
            },
        });

        that._map.addLayer(that.trackPlayLayer);
    }

    //轨迹标记移动事件
    moveFeature(event) {
        let that = self;
        that.eventInstance = event;
        const speed = that.playSpeed*10;
        const time = event.frameState.time;
        const elapsedTime = time - that.lastTime;
        that.distance = (that.distance + (speed * elapsedTime) / 1e6) % 2;
        that.lastTime = time;
        //计算当前播放进度
        let distanceRate = that.distance > 1 ? that.distance-1 : that.distance;
        that.updateTime(distanceRate);
        const currentCoordinate = that.trackDataSource.getCoordinateAt(distanceRate);
        console.log(currentCoordinate);
        that.trackMarkerPosition.setCoordinates(currentCoordinate);
        const vectorContext = getVectorContext(event);
        vectorContext.setStyle(styles.geoMarker);
        vectorContext.drawGeometry(that.trackMarkerPosition);
        // tell OpenLayers to continue the postrender animation
        that._map.render();
    }

    //更新时间轴
    updateTime(value) {
        let that = this;
        that.timeline.value = Math.floor(value * 100);
    }
    //更新轨迹标记位置
    updateMarkerPosition() {
        let that = this;
        const currentCoordinate = that.trackDataSource.getCoordinateAt(
           that.distance
        );
        that.trackMarkerPosition.setCoordinates(currentCoordinate);
        const vectorContext = getVectorContext(that.eventInstance);
        vectorContext.setStyle(styles.geoMarker);
        vectorContext.drawGeometry(that.trackMarkerPosition);
        // tell OpenLayers to continue the postrender animation
        that._map.render();

        if(that.animating){ 
            //暂停播放
            that.stopAnimation();
        }
    }

    //开始播放
    startAnimation() {
        let that = this;
        that.animating = true;
        that.lastTime = Date.now();
        that.playPauseButton.innerText = 'Stop';
        that.trackPlayLayer.on('postrender',that.moveFeature);
        // hide geoMarker and trigger map render through change event
        that.trackMarkerSource.setGeometry(null);
    }

    //停止播放
    stopAnimation() {
        let that = this;
        that.animating = false;
        that.playPauseButton.innerText = 'Play';

        // Keep marker at current animation position
        that.trackMarkerSource.setGeometry(that.trackMarkerPosition);
        that.trackPlayLayer.un('postrender',that.moveFeature);
    }
}
export default TrackPlaySymbol;