import ShipSymbol from './shipSymbol';
/**
 * 船位服务类
 * @module ol/ship/shipService
 */
class shipService {
    constructor(mapInstance, options) {
        let that = this;
        this._map = mapInstance;
        this.options = {

        }
        that.options = Object.assign(that.options, options);
        this.shipSymbol = new ShipSymbol(this._map, that.options);
    }

    //展示区域船
    async showAreaShip() {
        let that = this;
        //获取区域船数据
        const shipData = await that.getAreaShipData();
        this.shipSymbol.drawAreaShip(shipData);
    };
    //获取区域船数据
    getAreaShipData() {
        let that = this;
        return new Promise((resolve, reject) => {
            const data = require('../track/world-cities.json');
            if(data) {
                resolve(data);
            } else {
                reject(new Error('no data'));
            }
        });
    };
    removeAreaShip() {
        this.shipSymbol.removeAreaShip();
    };
    
}
export default shipService;