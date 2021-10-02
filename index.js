console.log('\x1B[36m%s\x1b[0m', "Servsync - Sync files between servers.");
console.log('\x1B[35m%s\x1b[0m', "By WinslowEric.CN");
var config;
const fs = require("fs");
console.log('\x1B[34m%s\x1b[0m', "Loading config.json");
try {
	var fileConfig = JSON.parse(fs.readFileSync(__dirname + '/config.json', function(err, data) {
		if (err) {
			console.log('\x1B[31m%s\x1b[0m', "Error when reading config.json");
		}
	}));
	config = fileConfig;
} catch(e) {
	console.log('\x1B[31m%s\x1b[0m', "Error when parsing config.json");
}

console.log(config);
