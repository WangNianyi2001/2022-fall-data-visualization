import _ from 'lodash/fp.js';
import * as JSONC from 'jsonc-parser';

document.addEventListener('DOMContentLoaded', async () => {
	// #region Init data
	/** @type { *[] } */
	const games = await (async url => {
		const reader = (await fetch(url)).body.getReader();
		const arr = [];
		for(let read; !(read = await reader.read()).done; )
			arr.push(read.value);
		return JSONC.parse(await new Blob(arr).text());
	})('./data.jsonc');
	
	const countries = _.pipe(
		_.flatMap(_.pipe(_.get('countries'), _.map(_.get('name')))),
		_.uniq,
		_.map(name => ({ name, medals: [0, 0, 0] }))
	)(games);
	// #endregion

	// #region DOM
	const $shadows = document.querySelector('#shadows');
	const $countries = document.querySelector('#countries');
	for(const [i, country] of countries.entries()) {
		const $shadow = document.createElement('div');
		$shadow.classList.add('shadow');
		$shadow.dataset['i'] = i.toString();
		$shadows.appendChild($shadow);

		const $country = document.createElement('div');
		$country.classList.add('country');
		$country.dataset['name'] = country.name;
		$country.style.setProperty('--medal', _.sum(country.medals));
		$country.style.transitionDuration = '0s';
		$country.style.setProperty('--bgColor', `hsl(${Math.random()}turn 50% 80%)`);
		$countries.appendChild($country);
		
		const $bg = document.createElement('div');
		$bg.classList.add('bg');
		$country.appendChild($bg);
		
		const $label = document.createElement('div');
		$label.classList.add('label');
		$label.innerText = country.name;
		$bg.appendChild($label);
	}
	UpdateChart();
	await new Promise(setTimeout);
	for(const $country of $countries.children)
		$country.style.transitionDuration = '';
	// #endregion

	function UpdateChart() {
		countries.sort((a, b) => -(_.sum(a.medals) - _.sum(b.medals)));
		countries.sort((a, b) => -(_.sum(a.medals) - _.sum(b.medals)));
		countries.sort((a, b) => -(_.sum(a.medals) - _.sum(b.medals)));
		for(const [i, country] of countries.entries()) {
			const $country = $countries.querySelector(`.country[data-name='${country.name}']`);
			const $shadow = $shadows.querySelector(`.shadow[data-i='${i}']`);
			if(!$country || !$shadow)
				continue;
			$country.querySelector('.label').dataset['medal'] = _.sum(country.medals).toString();
			$country.style.transform = `translateX(${$shadow.offsetLeft}px)`;
		}
	}

	const gameIt = games.values();

	// #region Bind events
	_.pipe(
		_.toPairs,
		_.forEach(([selector, handlers]) => {
			for(const $ of document.querySelectorAll(selector)) {
				for(const [type, handler] of Object.entries(handlers))
					$.addEventListener(type, handler);
			}
		})
	)({
		'#next': {
			async click() {
				const it = gameIt.next();
				if(it.done) {
					this.disabled = true;
					return;
				}
				const game = it.value;
				for(const record of game.countries) {
					const country = countries.find(c => c.name === record.name);
					const prev = country.medals;
					const delta = record.medals;
					country.medals = prev.map((n, i) => n + delta[i]);
				}
				UpdateChart();
			}
		}
	});
	// #endregion
});
