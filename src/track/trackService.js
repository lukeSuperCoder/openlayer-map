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
    }
    //添加轨迹
    async addTrack(mmsi, startTime, endTime, options) {
        let that = this;
        let track_key = 'track' + '_' + mmsi + '_' + startTime + '_' + endTime;
        const trackData = await that.getTrackData(mmsi, startTime, endTime, options);
        if(trackData) {
            that.tracks[track_key] = {
                mmsi: mmsi,
                startTime: startTime,
                endTime: endTime,
                trackData: trackData,
                trackSymbol: new TrackSymbol(that._map,that.options),
            }
            that.tracks[track_key].trackSymbol.showTrack(trackData);
        }
    };
    //获取轨迹数据
    getTrackData() {
        let that = this;
        return new Promise((resolve, reject) => {
            const data = require('./world-cities.json');
            if(data) {
                resolve(data);
            } else {
                reject(new Error('no data'));
            }
        });
    };
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