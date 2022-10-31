import { CreateElement, FindElement, ModifyElement } from './utils.mts';

(async () => {
	const menu = await (async () => {
		const raw = await (await fetch('menu.md')).text();
		const arr = raw.split('#').slice(1).map(entry => {
			const index = entry.indexOf('\n');
			const name = entry.slice(0, index);
			const recipe = entry.slice(index + 1);
			return { name, recipe };
		});
		return new Map(arr.map(entry => [entry.name, entry]));
	})();

	const preciselyContain = str => [str, entry => entry.recipe.indexOf(str) !== -1];
	const implicitlyContain = ([name, matches]) => [name, entry => matches.some(match => entry.recipe.indexOf(match) !== -1)];

	const filterCategories = new Map(Array.from(Object.entries({
		'基酒': '威士忌 伏特加 白兰地 朗姆 龙舌兰 金酒'
			.split(' ')
			.map(preciselyContain),
		'果味': [
			['橙子', ['橙']],
			['西柚', ['柚']],
			['蜜桃', ['桃']],
			['柠檬', ['柠檬汁']],
			['薄荷', ['薄荷']],
			['其他', ['菠萝']],
		].map(implicitlyContain),
		'调味': [
			['苦艾', ['苦艾']],
			['牛奶', ['奶']],
			['蛋黄', ['蛋']],
			['利口', ['利口']],
		].map(implicitlyContain),
		'口味': [
			['甜', ['甜', '奶', '巧克力', '可可', '朗姆']],
			['酸', ['柠檬', '酸']],
			['苦', ['苦']],
		].map(implicitlyContain),
		'温度': [
			implicitlyContain(['凉', ['冰']]),
			['常温', entry => !entry.recipe.match(/冰|热/)],
			implicitlyContain(['热', ['热']]),
		],
		'装饰': ['有', '无'].map((name, i) => [name, entry => i == !entry.recipe.match(/一(个|片|颗|块)/)]),
	})).map(([key, value]) => [key, new Map(value)]));
	
	function Load() {
		const $menu = FindElement('#menu', document.body, {
			children: Array.from(menu.values()).map(
				entry => CreateElement('li', {
					classes: 'entry',
					rawAttributes: { entry },
					children: CreateElement('details', {
						children: [
							CreateElement('summary', {
								classes: 'name',
								text: entry.name
							}),
							CreateElement('p', {
								text: entry.recipe
							})
						]
					})
				})
			)
		});

		function Update() {
			const filterCategories = Array.from(document.getElementsByClassName('category')).map(
				$category => Array.from($category.getElementsByClassName('filter'))
					.filter($filter => $filter.control.checked)
					.map($filter => $filter.control.filter)
			);
			Array.from(document.getElementsByClassName('entry')).forEach($entry => {
				const pass = filterCategories.every(
					category => !category.length || !category.every(filter => !filter.call($entry.control, $entry.entry))
				);
				ModifyElement($entry, {
					classes: (pass ? '-' : '+') + 'out'
				});
			});
		}

		const $filters = FindElement('#filters', document.body, {
			children: Array.from(filterCategories.entries()).map(([categoryName, filters]) => CreateElement('p', {
				classes: ['category'],
				children: [
					CreateElement('span', {
						classes: 'label',
						text: categoryName
					}),
					...Array.from(filters.entries()).map(([name, filter]) => CreateElement('label', {
						classes: ['filter'],
						text: name,
						children: CreateElement('input', {
							attributes: {
								type: 'checkbox',
							},
							rawAttributes: { filter }
						})
					}))
				]
			})),
			listeners: [['change', Update]]
		});

		$filters.addEventListener('change', Update);
		Update();
	}

	if(document.readyState === 'loading')
		document.addEventListener('DOMContentLoaded', Load);
	else
		Load();
})();
