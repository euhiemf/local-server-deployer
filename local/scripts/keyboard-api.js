
export function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Keyboard {

	constructor() {
		this.typeOneKey = this.typeOneKey.bind(this);
		this.type = this.type.bind(this);
	}

	sleep() {
		return getRandomInt(100, 400);
	}

	typeOneKey(key) {
		return new Promise((resolve) => {
			page.sendEvent('keydown', key);
			setTimeout(() => {
				page.sendEvent('keyup', key);
				resolve();
			}, this.sleep());
		});
	}

	type(string) {
		return new Promise((resolve, reject) => {
			let index = 0;

			let iterate = () => {
				index++;
				if (index >= string.length) {
					resolve();
					return;
				}
				setTimeout(() => {
					this.typeOneKey(string[index]).then(iterate);
				}, this.sleep())
			};

			this.typeOneKey(string[index]).then(iterate);
		});
	}

}


export default (new Keyboard())
