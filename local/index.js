
var path = require('path');
var cp = require('child_process');

var phantomjs = require('phantomjs-prebuilt');
var bpath = phantomjs.path;


var phantom_args = [
	"--ignore-ssl-errors=true",
	"--web-security=false"
];


function launchPhantom() {
	var program = phantomjs.exec(path.join(__dirname, 'build/compiled.js'), ...phantom_args);
	program.stdout.pipe(process.stdout);
	program.stderr.pipe(process.stderr);

	program.on('exit', (code) => {
		console.log('exit: ' + code);
	})
}



var bc = "browserify --exclude webpage --exclude system -t [ babelify --presets [ es2015 ] ] "
		+ path.join(__dirname, 'scripts/script.js')
		+ " --outfile "
		+ path.join(__dirname, 'build/compiled.js');

cp.exec(bc, (err, stdout, stderr) => {

	if (/^win/.test(process.platform)) return launchPhantom();

	cp.exec(". ./tor-launch.sh --require-tor", (err, stdout, stderr) => {
		launchPhantom();
	});


});

// browserify --exclude webpage --exclude system -t [ babelify --presets [ es2015 ] ] script.js --outfile compiled.js && exit

// phantomjs --ignore-ssl-errors=true --web-security=false compiled.js || EXIT /B
// . ./run.sh --require-tor
