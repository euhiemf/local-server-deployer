const cp = require('child_process');


function runBrowserify(cb) {
	var bc = "browserify --exclude webpage --exclude system -t [ babelify --presets [ es2015 ] ] "
		+ './scripts/script.js '
		+ " --outfile "
		+ './build/compiled.js';


	cp.exec(bc, (err, stdout, stderr) => {
		console.log('Scripts compiled via: ' + bc);
		cb();
	});
}

function execPhantomJS() {

	var phantom_args = [
		"--ignore-ssl-errors=true",
		"--web-security=false",
		'./build/compiled.js'
	];

	let phantom = cp.spawn('phantomjs', phantom_args);

	phantom.stdout.pipe(process.stdout)
	phantom.stderr.pipe(process.stdout)

	phantom.on('close', (code) => {
		console.log('phantomjs exited with code ' + code);
	});


}


runBrowserify(() => {
	execPhantomJS();
})
