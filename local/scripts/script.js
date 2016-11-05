
import "babel-polyfill";

var page = require('webpage').create(),
	system = require('system');

global.page = page;
global.system = system;

require('./crawler.js');