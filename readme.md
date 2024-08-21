
## 项目架构
基于openlayer二次封装地图包,包含基本要素渲染、服务叠加、轨迹、船位服务管理、地图交互、专题类渲染、地图基础功能等。

<img width="914" alt="研判ol地图包" src="https://github.com/user-attachments/assets/cf48f378-51c6-4690-8588-3daad824157b">


# 注释写法
/**
 * 计算并返回两个数的和。
 * 
 * @param {number} a 第一个加数。
 * @param {number} b 第二个加数。
 * @return {number} 返回两个数的和。
 * 
 * @example
 * // 返回5
 * add(2, 3);
 * 
 * @throws {TypeError} 如果参数不是数字类型，则抛出TypeError。
 */
function add(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new TypeError('所有参数必须是数字类型。');
    }
    return a + b;
}
