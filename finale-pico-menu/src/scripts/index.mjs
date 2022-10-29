import { CreateElement, FindElement, ModifyElement } from './utils.mts';

(async () => {
	const menu = await (async () => {
		const raw = await (await fetch('/menu.md')).text();
		const arr = raw.split('#').slice(1).map(entry => {
			const index = entry.indexOf('\n');
			const name = entry.slice(0, index);
			const recipe = entry.slice(index + 1);
			return { name, recipe };
		});
		return new Map(arr.map(entry => [entry.name, entry]));
	})();

	const filterCategories = new Map(Array.from(Object.entries({
		'基酒': [
			'威士忌',
			'龙舌兰',
			'金酒',
			'朗姆'
		].map(name => [name, entry => entry.recipe.indexOf(name) != -1])
	})).map(([key, value]) => [key, new Map(value)]));
	
	function Load() {
		const $menu = FindElement('#menu', document.body, {
			children: Array.from(menu.values()).map(
				entry => CreateElement('li', {
					classes: 'entry',
					rawAttributes: { entry },
					children: [
						CreateElement('span', {
							text: entry.name
						})
					]
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
					category => !category.length || !category.every(filter => !filter($entry.entry))
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
