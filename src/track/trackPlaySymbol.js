/**
 * 轨迹播放渲染类
 * @module TrackPlaySymbol
 */
import Feature from 'ol/Feature.js';
import GeoJSON from 'ol/format/GeoJSON';
import Point from 'ol/geom/Point.js';
import Polyline from 'ol/format/Polyline.js';
import { LineString, Polygon } from 'ol/geom';
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
    'area': new Style({
        stroke: new Stroke({
            color: 'rgba(255, 0, 0, 0.5)',
            width: 2,
        }),
        fill: new Fill({
            color: 'rgba(255, 0, 0, 0.2)',
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
        that.timelineContainer = null;
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
        that.currentSpeed = 1;
        //多轨迹集合
        that.trackPlayOnlyFlag = true;
        that.trackFeatures = [];
        that.baseTrackFeature = null;
        that.trackAreaBounds = null;    
        self = that;
    }
    //创建时间轴UI
    createTimelineUI() {
        //创建父容器
        this.timelineContainer = document.createElement('div');
        this.timelineContainer.style.position = 'absolute';
        this.timelineContainer.style.width = '450px';
        this.timelineContainer.style.top = '0px';
        this.timelineContainer.style.left = '50px';
        document.body.appendChild(this.timelineContainer);

        // 创建时间轴
        this.timeline = document.createElement('input');
        this.timeline.type = 'range';
        this.timeline.min = 0;
        this.timeline.max = 100;
        this.timeline.value = 0;
        this.timeline.style.width = '100%';
        this.timeline.style.position = 'absolute';
        this.timeline.style.top = '80px';
        this.timelineContainer.appendChild(this.timeline);
    
        // 创建播放/暂停按钮
        this.playPauseButton = document.createElement('button');
        this.playPauseButton.innerText = 'Play';
        this.playPauseButton.style.position = 'absolute';
        this.playPauseButton.style.top = '100px';
        this.timelineContainer.appendChild(this.playPauseButton);

        // 创建播放速度调节按钮
        this.playSpeedButton = document.createElement('button');
        this.playSpeedButton.innerText = 'Speed: '+this.playSpeed+'x';
        this.playSpeedButton.style.position = 'absolute';
        this.playSpeedButton.style.top = '100px';
        this.playSpeedButton.style.left = '50px';
        this.timelineContainer.appendChild(this.playSpeedButton);

        //创建时间刻度
        this.timelineSplits = document.createElement('div');
        this.timelineSplits.style.position = 'absolute';
        this.timelineSplits.style.top = '100px';
        this.timelineSplits.style.left = '120px';
        this.timelineContainer.appendChild(this.timelineSplits);
    }
    
    //删除时间轴UI
    removeTimelineUI() {
        document.body.removeChild(this.timelineContainer);
        this.timelineContainer = null;
        this.timeline = null;
        this.playPauseButton = null;
        this.playSpeedButton = null;
        this.timelineSplits = null;
        this.eventInstance = null;
        this.animating = false;
        this.distance = 0;
    }
    //添加时间轴监听事件
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
    //解除时间轴监听事件
    removeEventListeners() {
        // this.playPauseButton.removeEventListener('click', this.startAnimation);
        // this.timeline.removeEventListener('input', this.updateMarkerPosition);
        // this.playSpeedButton.removeEventListener('click', this.playSpeedButton);
    }
    //添加轨迹
    addTrack(trackData) {
        let that = this;
        that.trackPlayOnlyFlag = true;
        if(that.timeline){
            that.removeTimelineUI();
            that.removeTrack();
        }
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

    //添加多段轨迹
    addTracks(trackData) {
        let that = this;
        that.trackPlayOnlyFlag = false;
        if(that.timeline){
            that.removeTimelineUI();
            that.removeTrack();
        }
        that.createTimelineUI();
        that.setupEventListeners();
        console.log(trackData);
        that.trackFeatures = [];
        let maxTimeRange = 0;
        let baseTrack = null;
        //创建轨迹播放图层
        that.trackPlayLayer = new VectorLayer({
            source: new VectorSource({
                features: [],
            }),
            style: function (feature) {
                return styles[feature.get('type')];
            },
        });
        if(that.trackAreaBounds) {
            const trackAreaFeature = new Feature({
                type: 'area',
                geometry: that.trackAreaBounds,
            })
            that.trackPlayLayer.getSource().addFeatures([trackAreaFeature])
        }
        // 为每条轨迹创建一个 Feature 并添加到轨迹集合中
        for(let track in trackData) {
            //创建轨迹线数据源
            let lineCoords = new LineString(trackData[track].map(item => {
                return [item.lng, item.lat]
            })).transform('EPSG:4326', 'EPSG:3857');
            
            const timeRange = trackData[track][trackData[track].length-1].utc - trackData[track][0].utc;
            //创建轨迹数据源
            const trackDataFeature = new Feature({
                type: 'route',
                geometry: lineCoords,
            });
            //创建起点标记
            const startMarker = new Feature({
                type: 'icon',
                geometry: new Point(lineCoords.getFirstCoordinate()),
            });
            const trackMarkerPosition = startMarker.getGeometry().clone();
            //创建标记源
            const trackMarkerSource = new Feature({
                type: 'geoMarker',
                geometry: trackMarkerPosition,
            });
            that.trackFeatures.push({
                trackDataFeature: trackDataFeature,
                trackMarkerPosition: trackMarkerPosition,
                trackMarkerSource: trackMarkerSource,
                trackData: trackData[track],
                timeRange: timeRange,
                currentSpeed: 1,
                mmsi: track,
                distance: 0,
                lastTime: null,
            })
            if (timeRange > maxTimeRange) {
                maxTimeRange = timeRange;
                baseTrack = track;
            }
            that.trackPlayLayer.getSource().addFeatures([trackDataFeature,trackMarkerSource]);
        }
        console.log(that.trackFeatures);
        that._map.addLayer(that.trackPlayLayer);
        //找到时间间隔最长的轨迹作为基准轨迹
        const baseTrackFeature = that.trackFeatures.filter(feature => feature.mmsi===baseTrack);
        if(baseTrackFeature.length>0) {
            that.baseTrackFeature = baseTrackFeature[0];
            that.timelineSplits.innerHTML = that.getTimelineSplits();
        }
    }

    //删除轨迹
    removeTrack() {
        let that = this;
        if(that.trackPlayLayer) {
            that._map.removeLayer(that.trackPlayLayer);
        }
    }
    //轨迹标记移动事件
    moveFeature(event) {
        let that = self;
        that.eventInstance = event;
        const speed = that.playSpeed*that.currentSpeed;
        const time = event.frameState.time;
        const elapsedTime = time - that.lastTime;
        that.distance = (that.distance + (speed * elapsedTime) / 1e6) % 2;
        that.lastTime = time;
        //计算当前播放进度
        let distanceRate = that.distance > 1 ? that.distance-1 : that.distance;
        //更新进度条
        that.updateTime(distanceRate);
        //获取对应的轨迹点数据
        const trackMarkerData = that.getTrackDataAt(distanceRate, that.trackDetailData);
        //根据当前航速更新速度基准
        that.currentSpeed = trackMarkerData.sog>1?trackMarkerData.sog:1;
        const date = that.formatDate(trackMarkerData.utc*1000);
        // console.log(trackMarkerData);
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

    //多轨迹移动事件监听
    renderFeatures(event) {
        let that = self;
        that.eventInstance = event;
        
        const speed = that.playSpeed*that.currentSpeed;
        const time = event.frameState.time;
        const elapsedTime = time - that.baseTrackFeature.lastTime;
        const distance = (that.baseTrackFeature.distance + (speed * elapsedTime) / 1e6) % 2;
        let distanceRate = distance>1?distance-1:distance;
        that.baseTrackFeature.distance = distanceRate;
        that.baseTrackFeature.lastTime = time;
        //更新进度条
        that.updateTime(distanceRate);
        // console.log(distanceRate);
        //获取对应的轨迹点数据
        const baseTrackMarkerData = that.getTrackDataAt(distanceRate, that.baseTrackFeature.trackData);
        // console.log(baseTrackMarkerData,'当前轨迹点');
        //根据当前轨迹点时间更新所有轨迹位置
        const baseTrackMarkerTime = baseTrackMarkerData.utc;
        that.trackFeatures.forEach((trackItem) => {
            //获取对应的轨迹点数据
            const trackMarkerData = that.getTrackDataAt(distanceRate, trackItem.trackData);
            // const findTrackMarker = that.findClosestDataByTime(feature.get('trackData'),baseTrackMarkerTime);
            // const feature_distance = (findTrackMarker.utc-feature.get('trackData')[0].utc) / feature.get('timeRange');
            // console.log(feature_distance);
            // console.log(findTrackMarker, '时间找到对应的轨迹点');
            const date = that.formatDate(trackMarkerData.utc*1000);
            // console.log(trackMarkerData);
            that.timelineSplits.innerHTML = that.getTimelineSplits(date);
            const currentCoordinate = trackItem.trackDataFeature.getGeometry().getCoordinateAt(distanceRate);
            // console.log(currentCoordinate);
            trackItem.trackMarkerPosition.setCoordinates(currentCoordinate);
            //如果当前轨迹点不在区域内，则跳过
            if(that.trackAreaBounds  && !that.trackAreaBounds.intersectsCoordinate(currentCoordinate)) {
                return;
            }
            // tell OpenLayers to continue the postrender animation
            const vectorContext = getVectorContext(event);
            styles.geoMarker.getText().setText('时间: '+date+' cog: '+trackMarkerData.cog+' sog: '+trackMarkerData.sog+' 吃水: '+trackMarkerData.draught);
            styles.geoMarker.getImage().setRotation(trackMarkerData.hdg);
            vectorContext.setStyle(styles.geoMarker);
            vectorContext.drawGeometry(trackItem.trackMarkerPosition);
        })
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
        if(that.trackPlayOnlyFlag) {
            const currentCoordinate = that.trackDataSource.getCoordinateAt(
                that.distance
            );
            that.trackMarkerPosition.setCoordinates(currentCoordinate);
            const vectorContext = getVectorContext(that.eventInstance);
            vectorContext.setStyle(styles.geoMarker);
            vectorContext.drawGeometry(that.trackMarkerPosition);
            // tell OpenLayers to continue the postrender animation
        } else {
            that.trackFeatures.forEach(track => {
                const currentCoordinate = track.trackDataFeature.getGeometry().getCoordinateAt(
                    that.distance
                );
                that.baseTrackFeature.distance = that.distance;
                track.trackMarkerPosition.setCoordinates(currentCoordinate);
                const vectorContext = getVectorContext(that.eventInstance);
                vectorContext.setStyle(styles.geoMarker);
                vectorContext.drawGeometry(track.trackMarkerPosition);
            })
        }
        that._map.render();
        if(that.animating) {
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
        if(that.trackPlayOnlyFlag) {
            //单轨迹监听事件
            that.trackPlayLayer.on('postrender',that.moveFeature);
            // hide geoMarker and trigger map render through change event
            that.trackMarkerSource.setGeometry(null);
        } else {
            that.trackFeatures.forEach(track => {
                track.lastTime = Date.now();
                track.trackMarkerSource.setGeometry(null);
            })
            //多轨迹监听事件
            that.trackPlayLayer.on('postrender',that.renderFeatures);
        }
        
    }

    //停止播放
    stopAnimation() {
        let that = this;
        that.animating = false;
        that.playPauseButton.innerText = 'Play';
        if(that.trackPlayOnlyFlag) {
            // Keep marker at current animation position
            that.trackMarkerSource.setGeometry(that.trackMarkerPosition);
            that.trackPlayLayer.un('postrender',that.moveFeature);
        } else {
            that.trackFeatures.forEach(track => {
                track.trackMarkerSource.setGeometry(track.trackMarkerPosition);
            })
            //多轨迹监听事件
            that.trackPlayLayer.un('postrender',that.renderFeatures);
        }
    }

    // 查找轨迹进度对应的数据
    getTrackDataAt(progress, data) {
        const dataLength = data.length;

        // 计算插值点的位置
        const index = Math.floor(progress * (dataLength - 1));
        const nextIndex = Math.ceil(progress * (dataLength - 1));

        // 插值比例
        const ratio = (progress * (dataLength - 1)) % 1;

        const currentData = data[index];
        const nextData = data[nextIndex];

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

    //二分法查找utc对应数据
    findClosestDataByTime(data, targetTime) {
        let low = 0;
        let high = data.length - 1;

        if (targetTime <= data[low].utc) {
            return low;
        }

        if (targetTime >= data[high].utc) {
            return high;
        }

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);

            if (data[mid].utc === targetTime) {
                return mid;
            } else if (data[mid].utc < targetTime) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        const lowDiff = Math.abs(data[low].utc - targetTime);
        const highDiff = Math.abs(data[high].utc - targetTime);

        return lowDiff < highDiff ? data[low] : data[high];
    }
    getTimelineSplits(time) {
        const currentTime = time? time : this.formatDate(this.trackPlayOnlyFlag?this.trackDetailData[0].utc*1000:this.baseTrackFeature.trackData[0].utc*1000);
        const endTime = this.formatDate(this.trackPlayOnlyFlag?this.trackDetailData[this.trackDetailData.length - 1].utc*1000:this.baseTrackFeature.trackData[this.baseTrackFeature.trackData.length-1].utc*1000);
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