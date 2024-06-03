import ShipService from './shipService';
/**
 * 船位管理类
 * @module ol/ship/ship
 */
class Ship {
    constructor(mapInstance, options) {
        let that = this;
        this._map = mapInstance;
        this.options = {

        }
        that.options = Object.assign(that.options, options);
        this.shipService = new ShipService(this._map, this.options);
    }
    showAreaShip() {
        this.shipService.showAreaShip();
    }
}
export default Ship;