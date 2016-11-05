
const cp = require('child_process');
const path = require('path');
const fs = require('fs');

const cwd = process.env.npm_config_prefix;


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

function chain(func, ...args) {
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







function binExistsInPath(resolve, reject, command) {

	cp.exec('if type "' + command + '" &> /dev/null; then echo true; else echo false; fi', (err, stdout, stderr) => {

		let exists = stdout.replace(/\s/g, '') === 'true';

		if (exists) {
			resolve(command);
		} else {
			reject(command);
		}

	});

}

function fileExists(resolve, reject, fpath) {

	cp.exec(`if [ ! -f "${fpath}" ]; then echo false; else echo true; fi`, (err, stdout, stderr) => {

		let exists = stdout.replace(/\s/g, '') === 'true';

		if (exists) {
			resolve(fpath);
		} else {
			reject(fpath);
		}

	});

}

function runBrowserify(resolve, reject) {
	var bc = "browserify --exclude webpage --exclude system -t [ babelify --presets [ es2015 ] ] "
		+ path.join(cwd, 'scripts/script.js')
		+ " --outfile "
		+ path.join(cwd, 'build/compiled.js');


	cp.exec(bc, (err, stdout, stderr) => {
		console.log('Scripts compiled via: ' + bc);
		resolve();
	});
}

function execPhantomJS(bpath) {

	var phantom_args = [
		"--ignore-ssl-errors=true",
		"--web-security=false",
		path.join(cwd, 'build/compiled.js')
	];

	let phantom = cp.spawn(bpath, phantom_args, {
		cwd: cwd
	});
	// console.log(phantom);

	phantom.stdout.on('data', (data) => {
		console.log('pjs-stdout: ' + data);
	});

	phantom.stderr.on('data', (data) => {
		console.log('pjs-stderr: ' + data);
	});


	phantom.on('close', (code) => {
		console.log('phantomjs exited with code ' + code);
	});


}

function npmInstall(resolve, reject) {
	let args = ['--prefix', cwd, 'install', cwd];

	let installer = cp.spawn('npm', args);

	installer.stdout.on('data', (data) => {
		console.log('npm-stdout: ' + data);
	});

	installer.stderr.on('data', (data) => {
		console.log('npm-stderr: ' + data);
	});


	installer.on('close', (code) => {
		console.log('npm exited with code ' + code);
		resolve();
	});

}

function saveHostConfig(resolve, reject) {

	cp.exec(`ip addr | grep 'state UP' -A2 | tail -n1 | awk '{print $2}' | cut -f1  -d'/'`, (err, stdout, stderr) => {
		let ip = stdout.replace(/\s/g, '');
		let config = {
			ip: ip,
			cwd: cwd
		};
		fs.writeFile(path.join(cwd, 'build/host_config.json'), JSON.stringify(config), (err) => {
			resolve();
		});
	});

}

module.exports = {
	execPhantomJS: execPhantomJS,
	runBrowserify: runBrowserify,
	binExistsInPath: binExistsInPath,
	chain: chain,
	npmInstall: npmInstall,
	saveHostConfig: saveHostConfig,
	fileExists: fileExists
}
