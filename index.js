console.log('\x1B[36m%s\x1b[0m', "Servsync - Sync files between servers.");
console.log('\x1B[35m%s\x1b[0m', "By WinslowEric.CN");
var config;
var slaveConfig = {
	"originMode": null,
	"autoMode": null,
	"customMapMode": null,
};
var detailConfig = {
	"origin":null,
	"auto": null,
	"customMap": null,
	"master": null
};
var masterConfig = null;
const fs = require("fs");
if(!moduleAvailable("crypto")){
	console.log('\x1B[31m%s\x1b[0m', "Package crypto is required to run Servsync.");
	process.exit(1);
}
const crypto = require("crypto");
const isLoggingEnabled = true; //Set to false if you don't want log.

if(!isLoggingEnabled){
	console.log = function (nonsense){};
}
console.log('\x1B[34m%s\x1b[0m', "Loading config.json ...");
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

slaveConfig.originMode = config.as_slave.origin_mode;
slaveConfig.autoMode = config.as_slave.auto_mode;
slaveConfig.customMapMode = config.as_slave.customMap_mode;
masterConfig = config.as_master;

if(slaveConfig.originMode.isEnabled){
	detailConfig.origin = [];
	for(var i=0;i<slaveConfig.originMode.origins.length;i++){
		try {
			var fileConfig = JSON.parse(fs.readFileSync(__dirname + slaveConfig.originMode.origins[i] , function(err, data) {
			if (err) {
				console.log('\x1B[31m%s\x1b[0m', "Error when reading " + slaveConfig.originMode.origins[i]);
			}
		}));
		detailConfig.origin.push(fileConfig);
		} catch(e) {
			console.log('\x1B[31m%s\x1b[0m', "Error when parsing " + slaveConfig.originMode.origins[i]);
		}
	}
}

if(slaveConfig.autoMode.isEnabled){
	try {
		var fileConfig = JSON.parse(fs.readFileSync(__dirname + slaveConfig.autoMode.config , function(err, data) {
			if (err) {
				console.log('\x1B[31m%s\x1b[0m', "Error when reading " + slaveConfig.autoMode.config);
			}
		}));
		detailConfig.auto = fileConfig;
	} catch(e) {
		console.log('\x1B[31m%s\x1b[0m', "Error when parsing " + slaveConfig.autoMode.config);
	}
}

if(slaveConfig.customMapMode.isEnabled){
	try {
		var fileConfig = JSON.parse(fs.readFileSync(__dirname + slaveConfig.customMapMode.config , function(err, data) {
			if (err) {
				console.log('\x1B[31m%s\x1b[0m', "Error when reading " + slaveConfig.customMapMode.config);
			}
		}));
		detailConfig.customMap = fileConfig;
	} catch(e) {
		console.log('\x1B[31m%s\x1b[0m', "Error when parsing " + slaveConfig.customMapMode.config);
	}
}

if(masterConfig.isEnabled){
	try {
		var fileConfig = JSON.parse(fs.readFileSync(__dirname + masterConfig.config , function(err, data) {
			if (err) {
				console.log('\x1B[31m%s\x1b[0m', "Error when reading config.json");
			}
		}));
		detailConfig.master = fileConfig;
	} catch(e) {
		console.log('\x1B[31m%s\x1b[0m', "Error when parsing config.json");
	}
}
console.log(detailConfig);

console.log('\x1B[32m%s\x1b[0m', "Server " + config.general.server_name + " : " + slaveConfig.originMode.origins.length 
			+ " Origins, " + detailConfig.auto.list.length + " Folders as slave, " + detailConfig.customMap.list.length + " custom maps, "
			+ detailConfig.master.folders.length + " Folders as Master"
			);


function hash(file){
  var testFile = fs.readFileSync(file);
  var sha1sum = crypto.createHash('sha1').update(testFile).digest("hex");
  return sha1sum;
}

function checkMapFileExist(folder){
	try {
		if(fs.existsSync(folder + "/map.servsync.json")) {
		}
	}catch(err) {
		console.error(err);
	}
}

function createMapFile(folder, version){
	var folderFileList = fs.readdirSync(folder);
	mapData = {
		"fileList":[]
	};
	for(var i=0;i<fileList.length;i++){
		mapData.fileList.push(
			{
				"file_name":folderFileList[i],
				"file_version": version,
				"file_hash": hash(folder + "/" + folderFileList[i])
			});
	}
	fs.writeFile(folder + "map.servsync.json", JSON.stringify(mapData), function(err) {
		if(err) {
			return console.log(err);
		}
		console.log("Created map file at" + folder);
	});
}

function moduleAvailable(name) {
    try {
        require.resolve(name);
        return true;
    } catch(e){}
    return false;
}
