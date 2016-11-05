var request = require('request');
var portscanner = require('portscanner');
var glob = require('glob');
var path = require('path').posix;
var fs = require('fs');
var net = require('net');

var server = net.createServer((socket) => {

	// process.stdout.pipe(socket);
	socket.pipe(process.stdout)

});

server.listen({
	port: 1337,
	host: '192.168.1.125'
});
// http://192.168.1.212:8080

var globed_folder = [],
	ports_to_be_investigated = [];

glob('./local/**', {ignore: "./local/node_modules/**"}, (err, files) => {

	globed_folder = files;

	var checked_ports = [],
		lower_port = 8080,
		upper_port = 8090;


	for (let i = lower_port; i <= upper_port; i++) {
		portscanner.checkPortStatus(i, '192.168.1.212', ((port, checked_ports) => {
			return (error, status) => {

				checked_ports.push(port);

				if (status !== 'closed') {
					ports_to_be_investigated.push(port)
				}

				if (checked_ports.length === 11) {
					if (ports_to_be_investigated.length > 0) {
						investigatePort(ports_to_be_investigated[0]);
					}
				}

			}
		})(i, checked_ports));
	}

});

function startDeployed(start, remote, port) {
	if ( ! start ) return;
	request.put(remote, (err, resp, body) => {
		if (err) return console.log(remote + err);
		console.log(body);
		nextPortToBeInvestigated(port);
	});
}

function deploy(remote, port) {



	var files_to_be_deployed = globed_folder.reduce((ob, fname) => {

		var new_file_name = fname.replace(/^(\.\/local)/, '').replace(/\s/g, '');

		if ( ! new_file_name || ! path.extname(new_file_name) ) return ob;

		var address = 'http://' + path.join(remote, new_file_name);

		return ob.concat([{
			local: fname,
			remote: address
		}]);

		
	}, []);

	var files_count = files_to_be_deployed.length;

	function createFile(d) {
		return request.post(d.remote, () => {
			files_count--;
			startDeployed(files_count === 0, 'http://' + remote, port);
		});
	}

	files_to_be_deployed.forEach((d) => {
		fs.createReadStream(d.local).pipe(createFile(d));
	})

}

function nextPortToBeInvestigated(current_port) {
	let index = ports_to_be_investigated.indexOf(current_port);
	ports_to_be_investigated.splice(index, 1);
	if (ports_to_be_investigated.length > 0) {
		investigatePort(ports_to_be_investigated[0]);
	} else {
		console.log('Everything deployed');
	}
}


function investigatePort(port) {
	var remote = '192.168.1.212:' + port;
	request.get('http://' + remote, (err, response, body) => {

		if ( ! body || err ) {
			console.log("Server not active @: " + port);
			return nextPortToBeInvestigated(port);
		} 

		if (body.replace(/\s/) === 'host-listener') {

			console.log('Deploying to ' + remote);

			request.delete('http://' + remote, () => {
				deploy(remote, port);
			});


		}
	})
}



