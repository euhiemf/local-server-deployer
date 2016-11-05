
import * as uuid from 'uuid'

export function assert$(resolve, reject) {
	if (page.evaluate(function () {
		return typeof window.jQuery === 'undefined';
	})) {
		if (page.injectJs('./node_modules/jquery/dist/jquery.min.js')) {
			resolve();
		} else {
			reject('was not able to inject jQuery');
		}
	} else {
		resolve();
	} 
}


export function expect(func, timeout, evaluator = null) { return () => {
	return new Promise((resolve, reject) => {

		let resolved = false;


		let toid = setTimeout(() => {
			if ( ! resolved ) {
				reject(`Did not complete expected promise in ${timeout} ms`);
			}
		}, timeout);

		let promise = func.call(null, evaluator).then((...args) => {
			clearTimeout(toid);
			resolved = true;
			resolve(...args);
		});


	})
}}

export function navigationRequest() { return new Promise((resolve, reject) => {

	function cb(url, type, willNavigate, main) {

		if (url !== 'about:blank') {
			resolve(arguments);
		} else {
			listenOnce('navigationRequested', cb);
		}

	}

	listenOnce('navigationRequested', cb);

})}

export function pageLoad() { return new Promise((resolve, reject) => {


	listenOnce('loadFinished', function (status) {

		if (status === 'success') {
			resolve(arguments);
		} else {
			reject('Network error occured a page load');
		}

	});

})}

export function resourceReceived(evaluator) { return new Promise((resolve, reject) => {

	page.onResourceReceived = function (response) {
		if ( (evaluator && evaluator(response)) || !evaluator ) {
			page.onResourceReceived = null;
			resolve(response);
		}
	};

})}

export function getIp() { return new Promise((resolve, reject) => {

	resourceReceived((response) => {
		return response.url === 'http://get_ip.comxa.com/default.php';
	}).then(resolve);

	page.evaluate(() => {
		$.get('http://get_ip.comxa.com/default.php');
	});

})}

export function urlChange(evaluator) { return new Promise((resolve, reject) => {

	page.onUrlChanged = function (response) {
		if ( (evaluator && evaluator(response)) || !evaluator ) {
			page.onUrlChanged = null;
			resolve(response);
		}
	};

})}


var _callbacks = {};
function _getCallback(event) {
	return (...args) => {

		_callbacks[event].forEach((cb_o, index) => {
			cb_o.func.call(cb_o.context, ...args);
			if (cb_o.once) {
				_callbacks[event].splice(index, 1);
			}
		});


	}
}
export function addEventListener(event, callback, context = null, once = false) {
	if ( ! _callbacks.hasOwnProperty(event) ) {
		_callbacks[event] = [];
		let camel_name = 'on' + event.slice(0, 1).toUpperCase() + event.slice(1);
		page[camel_name] = _getCallback(event);
	}

	let id = `${event}-${uuid.v1()}`;
	_callbacks[event].push({
		id: id,
		func: callback,
		context: context,
		once: once
	});

	return id;
}

export function listenOnce(event, callback, context = null) {
	addEventListener(event, callback, context, true);
}

export function removeEventListener(id) {
	if ( ! _callbacks.hasOwnProperty(event) ) return;

	for (let event in _callbacks) {
		if (_callbacks.hasOwnProperty(event)) {
			for (let i = 0; i < _callbacks[event].length; i++) {
				if (_callbacks[event][i].id === id) {
					_callbacks[event].splice(i, 1);
				}
			}
		}
	}
}

export function logcb() {
	console.log(JSON.stringify(_callbacks));
}


export function sleep(duration) {
	return () => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve();
			}, duration)
		});
	}
}


class PromiseData {
	constructor(data) {
		this.data = data;
	}
}

function cbWrapper(nativeCb) {
	return (...passed_data) => {
		nativeCb(new PromiseData(passed_data));
	}
}

var _chain_calls_count = 0;

export function chain(func, ...args) {
	return (passed_value) => {

		var passed_values = [];

		_chain_calls_count++;

		if (passed_value instanceof Error) {
			console.log(passed_value);
			console.log('Continuing the Promise chain from chain #' + _chain_calls_count);
			passed_values = [passed_value];
		} else if (passed_value instanceof PromiseData) {
			passed_values = passed_value.data;
		} else {
			passed_values = [passed_value];
		}


		return new Promise((resolve, reject) => {

			if (typeof func === 'string') {
				if (func === 'resolve') {
					cbWrapper(resolve)(...passed_values);
				} else if (func === 'reject') {
					cbWrapper(reject)(...passed_values);
				}
			} else {
				func(cbWrapper(resolve), cbWrapper(reject), ...args, ...passed_values);
			}
		});
	}
}