# 第二周：动态条形图

本作品基于 HTML5 实现了展示往届奥运会各国奖牌数排名的动态条形图。

预览网址：https://wangnianyi2001.github.io/2022-fall-data-visualization/w2-dynamic-bar-chart/dist/

## 数据处理

本作品的全部数据取自[作业附件](source.xls)中的第一页表单，收录了 2004 年以前世界各国在奥运会上获得过的奖牌数量。
拿到数据后，我首先在 Excel 里将不规整的行与列消除，导出成 CSV。
借助强大的正则表达式将纯文本形式的数据格式化成易于处理的格式后，转写成了 [JSON](public/data.jsonc)，方便在脚本中引用。

```json
// Schema
[
	{	// 一次奥运会
		"name": "奥运会名称",
		"countries": [	// 与会国家
			{
				"name": "国家名称",
				"medals": [1, 1, 1]	// 获得的金、银、铜牌数量
			}
		]
	}
]
```

## 开发细节

使用了 NodeJS + Vite，后者是一套静态前端内容开发框架，十分方便在本地预览以及解决各种资源的引用。
为了实现交换位置的效果，我并没有将顺序关系写死在 DOM 里，而是利用 CSS 的 `transform` 属性，让代表国家的元素与背景里的隐形锚点元素对齐。这样可以相对自由地操作它们的位置。

迭代时，只消在当前状态上为每个国家的奖牌数加上当届该国获得的奖牌数即可。

[JavaScript 脚本](index.mjs)中大量运用了 Lodash 的函数式编程套件，这对于处理复杂 schema 的数据很有帮助。如从源数据中获取历史上全体与会国家名：
```javascript
const countries = _.pipe(
	// 从源数据各届奥运会中获得国家名称数组并扁平化
	_.flatMap(_.pipe(_.get('countries'), _.map(_.get('name')))),
	// 过滤重复值
	_.uniq,
	// 初始化奖牌数记录
	_.map(name => ({ name, medals: [0, 0, 0] }))
)(games);
```

## 本地部署

要在本地部署此项目，在命令行运行以下命令：

```shell
$ git clone https://github.com/WangNianyi2001/2022-fall-data-visualization.git
$ cd 2022-fall-data-visualization/w2-dynamic-bar-chart
$ npm i
$ npm run dev --open	# Alternatively, npm run build
```
