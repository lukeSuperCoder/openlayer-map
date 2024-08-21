import TrackPlaySymbol from "./trackPlaySymbol";
import { LineString, Polygon } from 'ol/geom';
/**
 * 轨迹播放服务类
 * @module TrackPlayService
 */
class TrackPlayService {
    constructor(mapInstance, options) {
        let that = this;
        this._map = mapInstance;
        this.options = {

        }
        that.options = Object.assign(that.options, options);
        //创建轨迹播放渲染实例
        that.trackPlaySymbol = new TrackPlaySymbol(this._map, that.options);
    }

    //创建轨迹播放
    async addTrackPlay(mmsi, startTime, endTime, options) {
        let that = this;
        const trackData = await that.getTrackData(mmsi, startTime, endTime, options);
        that.trackPlaySymbol.addTrack(trackData);
    }
    //创建多段轨迹播放
    async addTracksPlay(mmsis, startTime, endTime, options) {
        let that = this;
        const trackData = await that.getTracksData(mmsis, startTime, endTime, options);
        that.trackPlaySymbol.addTracks(trackData);
    }
    //创建多段轨迹播放并通过区域过滤
    async addTracksPlayByArea(mmsis, startTime, endTime, options) {
        let that = this;
        const trackData = await that.getTracksData(mmsis, startTime, endTime, options);
        that.trackPlaySymbol.trackAreaBounds = new Polygon([
            [
                [118.716748, 24.590084],
                [118.716748, 26.245449],
                [121.312284, 26.245449],
                [121.312284, 24.590084],
                [118.716748, 24.590084]
            ]
        ]).transform('EPSG:4326', 'EPSG:3857');
        that.trackPlaySymbol.addTracks(trackData);
    }
    //获取轨迹数据
    getTrackData(mmsi, startTime, endTime, options) {
        let that = this;
        return new Promise((resolve, reject) => {
            const data = require('./trackData.json');
            if(data) {
                resolve(data);
            } else {
                reject(new Error('no data'));
            }
        });
    };
    //获取多段轨迹数据
    getTracksData(mmsis, startTime, endTime, options) {
        let that = this;
        return new Promise((resolve, reject) => {
            const data = require('./trackData2.json');
            if(data) {
                resolve(data);
            } else {
                reject(new Error('no data'));
            }
        });
    };
    //播放轨迹
    playTrack() {
        let that = this;
        that.trackPlaySymbol.playTrack();
    }
    //暂停轨迹播放
    pauseTrack() {
        let that = this;
        that.trackPlaySymbol.pauseTrack();
    }
    //移除轨迹播放
    removeTrackPlay() {
        that.trackPlaySymbol.removeTrackPlay();
    }
}
export default TrackPlayService;