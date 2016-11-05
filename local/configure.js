
const cwd = process.env.npm_config_prefix;
const cp = require('child_process');
const os = require('os');
const path = require('path');
const {chain, binExistsInPath, fileExists, runBrowserify, execPhantomJS, npmInstall, saveHostConfig} = require('./configure-api.js');

// const Promise = require('./scripts/es6-promise.js').Promise;
// # DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

// # IP="$(ip addr | grep 'state UP' -A2 | tail -n1 | awk '{print $2}' | cut -f1  -d'/')"







function configure() {

	// ASSUME BROWSERIFY ALREADY INSTALLED!

	// chain(binExistsInPath)('browserify')

	// 	.then(chain('resolve'))

	// 	.catch(chain((resolve, reject) => {
	// 		console.log('will install browserify');
	// 		cp.exec('npm install -g browserify', () => {
	// 			console.log('Did install browserify');
	// 			resolve();
	// 		});
	// 	}))

	// .then(chain(runBrowserify))


	chain((resolve, reject) => {
		let jq = require('jquery')
		if (jq) {
			resolve();
		}
	})()

		.then(chain('resolve'))

		.catch(chain(npmInstall))

	.then(chain(fileExists, path.join(cwd, 'build/host_config.json')))

		.then(chain('resolve'))

		.catch(chain(saveHostConfig))

	.then(chain(runBrowserify))


	.then(chain(binExistsInPath, 'tor'))

		.then(chain((resolve, reject) => {
			cp.exec('ps cax | grep " tor" > /dev/null ; if [ $? -eq 0 ]; then echo "Tor is running." ; else (tor &> /dev/null &) ; fi', () => {
				console.log('Started tor');
				resolve();
			});
		}))
		.catch(chain('resolve'))


		.then(chain(os.arch() === 'arm' ? 'resolve' : 'reject'))
			.then(chain((resolve, reject) => { // raspi
				let bpath = path.join(cwd, 'build/phantomjs');
				resolve(bpath);
			}))

			.catch(chain((resolve) => { // normal ASSUME PHANTOMJS IS ALREADY INSTALLED GLOBALLY
				resolve('phantomjs')
			}))

	.then((passed) => {
		let bpath = passed.data[0];
		execPhantomJS(bpath);
		console.log('Starting ' + bpath);
	}).catch((err) => {
		console.log(err);
	})

	// .then(chain(binExistsInPath, 'phantomjs'))

		// .then(chain('resolve'))

		// .catch(chain(os.arch() === 'arm' ? 'resolve' : 'reject'))

			// ASSUME BUILD/PHANTOMJS EXISTS ON RASPI

			// .then(chain(fileExists, path.join(cwd, 'build/phantomjs')))

				// .then(chain('resolve'))

				// .catch(chain((resolve, reject, bpath) => {
	// 				let phantom_download_url = 'https://github.com/fg2it/phantomjs-on-raspberry/raw/master/wheezy/2.0.1-development_as_1.9.8/phantomjs';

	// 				cp.exec(`curl ${phantom_download_url} -o ${bpath}`, () => {
	// 					resolve(bpath);
	// 				});
	// 			}))



			// ASSUME PHANTOMJS IS ALREADY INSTALLED GLOBALLY
			// .catch(chain((resolve, reject) => { // normal
	// 			cp.exec(`npm --prefix ${cwd} install phantomjs-prebuilt@2.1.1`, () => {

	// 				let phantomjs = require('phantomjs-prebuilt');
	// 				resolve(phantomjs.path);

	// 			});
	// 		}))


	// .then((bpath) => {
	// 	execPhantomJS(bpath);
	// })
}



configure();
