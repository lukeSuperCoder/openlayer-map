import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';

class BaseMapManager {
  constructor(mapInstance) {
    this.map = mapInstance;
    this.baseMaps = {
      'OSM': new TileLayer({
        source: new OSM(),
        visible: true,
      }),
      'Satellite': new TileLayer({
        source: new XYZ({
          url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
          visible: false
        })
      })
      // 在这里你可以添加更多的底图选项
    };
    this.addEveryBaseMap();
    // 默认添加第一个底图到地图中
    this.switchBaseMap('OSM');
  }

  /**
   * 将缓存的底图图层添加到地图中
   */
  addEveryBaseMap() {
    Object.keys(this.baseMaps).forEach((baseMapName) => {
      this.map.addLayer(this.baseMaps[baseMapName]);
    });
  }

  /**
   * 切换地图底图的显隐
   * @param {string} showBaseMapName 要展示的图层名称
   *
   */
  switchBaseMap(showBaseMapName) {
    Object.keys(this.baseMaps).forEach((baseMapName) => {
      const baseMapLayer = this.baseMaps[baseMapName];
      baseMapLayer.setVisible(baseMapName === showBaseMapName);
    });
  }
}
export default BaseMapManager;