import TrackSymbol from './trackSymbol'
/**
 * 轨迹服务类
 * @module TrackService
 */
class TrackService {
    constructor(mapInstance, options) {
        let that = this;
        this._map = mapInstance;
        this.options = {

        }
        that.options = Object.assign(that.options, options);
        that.tracks = {};   // 轨迹集合
        that._map.on('zoomend', (e) => {
            // that.updateTrackData();
        })
    }
    //添加轨迹
    async addTrack(mmsi, startTime, endTime, options) {
        let that = this;
        let track_key = 'track' + '_' + mmsi + '_' + startTime + '_' + endTime;
        const trackData = await that.getTrackData(mmsi, startTime, endTime, options);
        if(trackData) {
            //初始化轨迹集合
            that.tracks[track_key] = {
                mmsi: mmsi,
                startTime: startTime,
                endTime: endTime,
                trackDataMap: {},
                trackSymbol: new TrackSymbol(that._map,that.options),
            }
            that.tracks[track_key].trackSymbol.showTrack(trackData);
            that.updateTrackData(track_key, trackData);
        }
    };
    //获取轨迹数据
    getTrackData() {
        let that = this;
        return new Promise((resolve, reject) => {
            const data = require('./track-data.json');
            if(data) {
                resolve(data);
            } else {
                reject(new Error('no data'));
            }
        });
    };
    //更新轨迹数据
    updateTrackData(track_key, trackData) {
        let that = this;
        const zoom = that._map.getView().getZoom();
        //判断当前层级是否有轨迹数据，如果没有则添加
        if(that.tracks[track_key].trackDataMap[zoom]) {

        } else {
            that.tracks[track_key].trackDataMap[zoom] = trackData;
        }
    }
    //删除轨迹
    removeTrack(mmsi) {
        let that = this;
    };
    //隐藏轨迹
    hideTrack(mmsi) {
        let that = this;
    };
    //清除所有轨迹
    clearTracks() {
        let that = this;
    };
}
export default TrackService;