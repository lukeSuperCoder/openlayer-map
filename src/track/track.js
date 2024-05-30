import TrackService from "./trackService";
/**
 * 轨迹管理类
 * @module ol/track/Track
 */
class Track {
    constructor(mapInstance, options) {
        let that = this;
        this._map = mapInstance;
        this.options = {

        }
        that.options = Object.assign(that.options, options);
        this.trackService = new TrackService(this._map, this.options);
    }
    //添加轨迹
    addTrack(mmsi, startTime, endTime, options) {
        let that = this;
        that.trackService.addTrack(mmsi, startTime, endTime, options);
    };
    //删除轨迹
    removeTrack(mmsi) {
        let that = this;
        that.trackService.removeTrack(mmsi);
    };
    //隐藏轨迹
    hideTrack(mmsi) {
        let that = this;
        that.trackService.hideTrack(mmsi);
    };
    //清除所有轨迹
    clearTracks() {
        let that = this;
        that.trackService.clearTracks();
    };
}
export default Track;