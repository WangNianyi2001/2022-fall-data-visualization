type ListenerTrio<
	This extends HTMLElement,
	Type extends keyof HTMLElementEventMap
> = [
	Type,
	((this: This, ev: HTMLElementEventMap[Type]) => any),
	(boolean | AddEventListenerOptions)?
];

interface ElementOptions<This extends HTMLElement, Event extends keyof HTMLElementEventMap = any> {
	id?: string;
	classes?: string | string[];
	attributes?: {
		[key: string]: string;
	};
	rawAttributes?: {
		[key: string]: string;
	};
	html?: string;
	text?: string;
	parent?: HTMLElement;
	children?: HTMLElement | HTMLElement[];
	listeners?: ListenerTrio<This, Event>[];
	styles?: {
		[property: string]: string;
	};
	cssVars?: {
		[name: string]: string;
	};
}

export function ModifyElement<Type extends HTMLElement>(
	$element: Type,
	options: ElementOptions<Type>
): Type {
	if(options.id)
		$element.id = options.id;
	if(options.classes?.length) {
		const classes = options.classes instanceof Array ? options.classes : [options.classes];
		for(const className of classes) {
			switch(className[0]) {
				default:
					$element.classList.add(className);
					break;
				case '+':
					$element.classList.add(className.slice(1));
					break;
				case '-':
					$element.classList.remove(className.slice(1));
					break;
				case '~':
					$element.classList.toggle(className.slice(1));
					break;
			}
		}
	}
	if(options.attributes) {
		for(const [key, value] of Object.entries(options.attributes))
			$element.setAttribute(key, value);
	}
	if(options.rawAttributes) {
		for(const [key, value] of Object.entries(options.rawAttributes))
			$element[key] = value;
	}
	if(options.html)
		$element.innerHTML = options.html;
	if(options.text)
		$element.innerText = options.text;
	if(options.parent)
		options.parent.appendChild($element);
	if(options.children) {
		if(options.children instanceof Array)
			$element.append(...options.children);
		else
			$element.append(options.children);
	}
	if(options.listeners) {
		for(const [type, listener, _options] of options.listeners)
			$element.addEventListener(type, listener, _options);
	}
	if(options.styles) {
		for(const [property, value] of Object.entries(options.styles))
			$element.style[property] = value;
	}
	if(options.cssVars) {
		for(const [name, value] of Object.entries(options.cssVars))
			$element.style.setProperty(name, value);
	}
	return $element;
}


export function FindElement<Type extends HTMLElement = HTMLElement>(
	selector: string,
	parent?: HTMLElement | Document,
	options?: ElementOptions<Type>
): Type | null {
	const $element = (parent || document).querySelector(selector) as Type;
	if(!$element)
		return null;
	if(options)
		ModifyElement($element, options);
	return $element;
}

export function CreateElement<K extends keyof HTMLElementTagNameMap>(
	tag: K, options?: ElementOptions<HTMLElementTagNameMap[K]>
): HTMLElementTagNameMap[K] {
	const $element = document.createElement(tag);
	if(options)
		ModifyElement($element, options);
	return $element;
}

export function ClearChild(parent: Node) {
	for(const child of Array.from(parent.childNodes))
		parent.removeChild(child);
}
