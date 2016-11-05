
import {sleep as promiseSleep} from './logical-api';

export function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Mouse {

	constructor() {
		this.click = this.click.bind(this);
		this.moveTo = this.moveTo.bind(this);
		this.clickAt = this.clickAt.bind(this);
	}

	sleep() {
		return getRandomInt(100, 400);
	}
	click() {
		return new Promise((resolve) => {
			page.sendEvent('mousedown');
			setTimeout(() => {
				page.sendEvent('mouseup');

				resolve();

			}, this.sleep());
		});
	}

	moveTo(tag, offset_x = 0, offset_y = 0) {
		return new Promise((resolve, reject) => {

			let metrics = page.evaluate(function (tag) {
				var ret = window.jQuery(tag).get(0).getBoundingClientRect();
				return ret;
			}, tag);

			if ( ! metrics ) {
				reject(`The element ${tag} could not be found on the page`);
			} else {

				let {height, width, left: x, top: y} = metrics;


				x += height / 2;
				y += width / 2;

				x += offset_x;
				y += offset_y;

				setTimeout(() => {
					resolve();
				}, this.sleep());

				console.log((`Moving mouse to: (${x}, ${y})`));
				page.sendEvent('mousemove', x, y);
			}
		});
	}

	clickAt(tag, offset_x = 0, offset_y = 0) { return new Promise((resolve) => {


		let move = this.moveTo(tag, offset_x, offset_y);

		let click = move.then(this.click).catch((err) => {
			let args = Array.prototype.slice.call(arguments, 1).toString();
			console.log((`Move Error: ${err}, ${args}`));
		});

		click.then(promiseSleep(700)).then(resolve).catch((err) => {
			let args = Array.prototype.slice.call(arguments, 1).toString();
			console.log((`Click Error: ${err}, ${args}`));
		});
	})}
}


export default (new Mouse())
