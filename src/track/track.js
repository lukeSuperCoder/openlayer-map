import TrackService from "./trackService";
import TrackPlayService from "./trackPlayService";
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
        this.trackPlayService = new TrackPlayService(this._map, this.options);
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
    //添加轨迹播放
    addTrackPlay(mmsi, startTime, endTime, options) {
        let that = this;
        that.trackPlayService.addTrackPlay(mmsi, startTime, endTime, options);
    };
    //删除轨迹播放
    removeTrackPlay(mmsi) {
        let that = this;
        that.trackPlayService.removeTrackPlay(mmsi);
    };
    //播放轨迹
    playTrack() {
        let that = this;
        that.trackPlayService.playTrack();
    };
    //暂停轨迹播放
    pauseTrack() {
        let that = this;
        that.trackPlayService.pauseTrack();
    };
}
export default Track;