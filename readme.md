
## 项目架构
elane-ol-map/
├── src/
│   ├── src/  # 封装的组件
│   │   ├── Map.js
│   │   ├── Layer.js
│   │   └── Control.js
│   ├── utils/       # 工具函数
│   ├── index.js     # 库的主入口
├── dist/            # 打包后的文件
├── tests/           # 测试文件
├── README.md
├── package.json
└── webpack.config.js # 或其他构建配置文件

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