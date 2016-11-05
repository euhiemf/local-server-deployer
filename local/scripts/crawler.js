
// console.log('crawler is running from phantomjs!');
// phantom.exit();

import Mouse from './mouse-api'

import {assert$, expect, navigationRequest, chain} from './logical-api';


let host = '127.0.0.1';
let port = '9050';
let address = 'http://topalajnen.comxa.com';

page.viewportSize = {
	width: 1351,
	height: 654
};

page.onConsoleMessage = function(msg) {
  console.log(`VM: ${msg}`);
};

// phantom.setProxy(host, port, 'socks5', '', '');


chain((resolve, reject) => {
	page.open(address, (status) => {
		if (status !== 'success') {
			reject('FAIL to load the address "' + address + '" using proxy "' + host + ':' + port + '"');
		} else {
			resolve();
		}
	});

})()

.then(chain(assert$))

.then(chain((resolve, reject) => {

	page.evaluate(function () {
		window.jQuery('body').on('click mousemove mouseup mousedown', function (event) {
			console.log(`${event.type} at (${event.pageX}, ${event.pageY}) on ${window.jQuery(event.target).prop("tagName")}`);
		});
	});

	resolve();

}))

.then(chain((resolve, reject) => {
	resolve(page.evaluate(function () {
		return window.jQuery('pre').text();
	}));
}))

.then(chain((resolve, reject, text) => {
	console.log(text);

	resolve('passed1', 'passed2');
}))

.then(chain((resolve, reject, bind1, bind2, passed1, passed2) => {
	console.log(bind1, bind2, passed1, passed2);

	page.navigationLocked = true;

	resolve();
}, 'bind1', 'bind2'))


.then(chain((resolve) => {
	resolve();
	Mouse.clickAt('ul li:first-child a');
}))


.then(expect(navigationRequest, 1000))

.then(chain((resolve, reject, url, type, willNavigate, main) => {

	console.log('Trying to navigate to: ' + url);
	console.log('Caused by: ' + type);
	console.log('Will actually navigate: ' + willNavigate);
	console.log('Sent from the page\'s main frame: ' + main);

	resolve();

}))

.then(() => {
	phantom.exit()
})

.catch((error) => {
	console.log(error);
	phantom.exit();
});





