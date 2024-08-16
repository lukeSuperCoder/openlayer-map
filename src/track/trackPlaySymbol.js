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
    Text
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
            rotation: 0,
            color:'yellow',
            scale: 0.8,
        }),
        text: new Text({
            text: '',
            font: 'bold 14px Arial, sans-serif',
            fill: new Fill({
              color: '#000000', // 文本颜色
            }),
            stroke: new Stroke({
              color: '#ffffff', // 文本边框颜色
              width: 3, // 文本边框宽度
            }),
            backgroundFill: new Fill({
              color: 'rgba(255, 255, 255, 0.7)', // 文本框背景颜色
            }),
            padding: [5, 5, 5, 5], // 文本框内边距
            offsetY: -25, // 文本框在点上的垂直偏移量
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
        that.trackDetailData = [];
        that.timeline = null;
        that.playPauseButton = null;
        that.playSpeedButton = null;
        that.timelineSplits = null;
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

        //创建时间刻度
        this.timelineSplits = document.createElement('div');
        this.timelineSplits.style.position = 'absolute';
        this.timelineSplits.style.top = '100px';
        this.timelineSplits.style.left = '120px';
        document.body.appendChild(this.timelineSplits);
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
        var lineCoords = []
        trackData.data.forEach(item => {
            //4326转3857
            lineCoords.push([item.lng, item.lat]);
        })
        that.trackDetailData = trackData.data;  //轨迹详细数据
        that.timelineSplits.innerHTML = that.getTimelineSplits();
        that.trackDataSource = new LineString(lineCoords);
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
        //更新进度条
        that.updateTime(distanceRate);
        //获取对应的轨迹点数据
        const trackMarkerData = that.getTrackDataAt(distanceRate);
        const date = that.formatDate(trackMarkerData.utc*1000);
        console.log(trackMarkerData);
        that.timelineSplits.innerHTML = that.getTimelineSplits(date);

        const currentCoordinate = that.trackDataSource.getCoordinateAt(distanceRate);
        // console.log(currentCoordinate);
        that.trackMarkerPosition.setCoordinates(currentCoordinate);
        const vectorContext = getVectorContext(event);
        styles.geoMarker.getText().setText('时间: '+date+' cog: '+trackMarkerData.cog+' sog: '+trackMarkerData.sog+' 吃水: '+trackMarkerData.draught);
        styles.geoMarker.getImage().setRotation(trackMarkerData.hdg);
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

    // 查找轨迹进度对应的数据
    getTrackDataAt(progress) {
        const dataLength = this.trackDetailData.length;

        // 计算插值点的位置
        const index = Math.floor(progress * (dataLength - 1));
        const nextIndex = Math.ceil(progress * (dataLength - 1));

        // 插值比例
        const ratio = (progress * (dataLength - 1)) % 1;

        const currentData = this.trackDetailData[index];
        const nextData = this.trackDetailData[nextIndex];

        // 插值计算经纬度和其他数据
        const interpolatedData = {
            utc: Math.floor(currentData.utc * (1 - ratio) + nextData.utc * ratio),
            lng: currentData.lng,
            lat: currentData.lat,
            sog: currentData.sog,
            // 以下数据通常不插值，选择最近的状态
            cog: currentData.cog,
            hdg: currentData.hdg,
            hdg_source: currentData.hdg_source,
            navistatus: currentData.navistatus,
            mark: currentData.mark,             
            from: currentData.from,        
            draught: currentData.draught,
        };

        return interpolatedData;
    }

    getTimelineSplits(time) {
        const currentTime = time? time : this.formatDate(this.trackDetailData[0].utc*1000);
        const endTime = this.formatDate(this.trackDetailData[this.trackDetailData.length - 1].utc*1000);
        return `
        <div style="color: #000; font-size: 12px; margin-left: 20px;display: flex;justify-content: space-between;width:280px">
            <span style="width:45%">${currentTime}</span>
            <span>/</span> 
            <span style="width:45%">${endTime}</span>
        </div>
        `
    }
    formatDate(date) {
        date = new Date(date);
        const padZero = (num) => (num < 10 ? '0' + num : num);
    
        const year = date.getFullYear();
        const month = padZero(date.getMonth() + 1); // 月份从0开始，因此要加1
        const day = padZero(date.getDate());
    
        const hours = padZero(date.getHours());
        const minutes = padZero(date.getMinutes());
        const seconds = padZero(date.getSeconds());
    
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}
export default TrackPlaySymbol;