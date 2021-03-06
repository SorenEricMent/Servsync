console.log('\x1B[36m%s\x1b[0m', "Servsync - Sync files between servers.");
console.log('\x1B[35m%s\x1b[0m', "By WinslowEric.CN");
var config;
var isSyncLoopRunning = false;
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
if(!moduleAvailable("express")){
	console.log('\x1B[31m%s\x1b[0m', "Package express is required to run Servsync.");
	process.exit(1);
}
if(!moduleAvailable("body-parser")){
	console.log('\x1B[31m%s\x1b[0m', "Package body-parser is required to run Servsync.");
	process.exit(1);
}

const crypto = require("crypto");
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
var app = express();
var jsonParser = bodyParser.json();

Array.prototype.remove = function(index) {
	this.splice(index, 1);
};

Array.prototype.indexOfN = function(value){
	return this.findIndex(function(item, i){
		return item.name == value;
	});
};
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
		var fileConfig = readJSONFile(__dirname + slaveConfig.originMode.origins[i]); 
		detailConfig.origin.push(fileConfig);
	}
}

if(slaveConfig.autoMode.isEnabled){
		var fileConfig = readJSONFile(__dirname + slaveConfig.autoMode.config);
		detailConfig.auto = fileConfig;
}

if(slaveConfig.customMapMode.isEnabled){
	var fileConfig = readJSONFile(__dirname + slaveConfig.customMapMode.config);
	detailConfig.customMap = fileConfig;
}

if(masterConfig.isEnabled){
	var fileConfig = readJSONFile(__dirname + masterConfig.config);
	detailConfig.master = fileConfig;
}

app.listen(config.general.port, '127.0.0.1');
app.get('/', function (req, res) {
	//request.body
	res.send('<h2>Servsync Servlet</h2><br/>Server:' + config.general.server_name);
});
app.post('/serverGeneral', jsonParser, function(req, res) {
	if(req.body.token == config.general.api_token){
		var serverGeneral = {
			"server_name": config.general.server_name,
			"encryption": config.general.encrypt_enabled,
			"as_slave":{
				
			},
			"as_master": 0
		}
	}else{
		res.send({"status":401});	
	}
})
app.post('/changeInFolderVerStamp', jsonParser, function (req, res) {
	if(req.body.token == config.general.api_token){
		res.send({"status":200});
	}else{
		res.send({"status":401});	
	}	
});
app.post('/changeFileVerStamp', jsonParser, function (req, res) {
	if(req.body.token == config.general.api_token){
		res.send({"status":200});
	}else{
		res.send({"status":401});	
	}	
});
app.post('/syncStatus', jsonParser, function (req, res) {
	if(req.body.token == config.general.api_token){
		if(isSyncLoopRunning){
			res.send({"status":200});
		}else{
			res.send({"status":201});
		}
	}else{
		res.send({"status":401});	
	}	
});

app.post('/encryptLegacyMap', jsonParser, function (req, res) {
	if(req.body.token == config.general.api_token){
		encryptKey = convertKey(req.body.encrypt_key);
		targetLocation = req.body.path;
		if(checkMapFileExist(targetLocation){
			res.send({"status":200});
		}else{
			res.send({"status":300});
		}
	}else{
		res.send({"status":401});	
	}
});

app.post('/decryptLegacyMap', jsonParser, function (req, res) {
	if(req.body.token == config.general.api_token){
		decryptKey = converyKey(config.general.encrypt_key);
		targetLocation = req.body.path;
		if(checkMapFileExist(targetLocation){
			res.send({"status":200});
		}else{
			res.send({"status":300});
		}
		res.send({"status":200});
	}else{
		res.send({"status":401});	
	}
});
app.post('/syncLoop', jsonParser, function (req, res) {
	if(req.body.token == config.general.api_token){
		if(req.body.mode == "start"){
			if(isSyncLoopRunning){
				res.send({"status":201});
			}else{
				syncLoopBridge();
				res.send({"status":200});
			}
		}else if(req.body.mode == "stop"){
			if(isSyncLoopRunning){
				clearTimeout(nextRecursion);
				isSyncLoopRunning = false;
				res.send({"status":200});
			}else{
				res.send({"status":201});
			}
		}else{
			res.send({"status":402});
		}
	}else{
		res.send({"status":401});	
	}	
});
console.log('\x1b[5m%s\x1b[0m','Servsync API Server running at http://127.0.0.1:'+config.general.port+"/");
console.log('\x1B[32m%s\x1b[0m', "Server " + config.general.server_name + " : " + slaveConfig.originMode.origins.length 
			+ " Origins, " + detailConfig.auto.list.length + " Folders as Slave, " + detailConfig.customMap.list.length + " custom maps, "
			+ detailConfig.master.folders.length + " Folders as Master");
console.log('\x1B[32m%s\x1b[0m', "Temporary cache will be saved at "+ config.general.temp_directory);
			
			
function syncLoopBridge(){
	(function syncLoop() {
		isSyncLoopRunning = true;
    	console.log("WINSLOW, KEEP DETERMINATION!!!");
    	for(var i=0;i<detailConfig.origin.length;i++){
    		if(detailConfig.origin[i].hyper_master){
    			if(detailConfig.origin[i].checkHash){
    				for(var j=0;j<detailConfig.origin[i].file_list.length;j++){
    					var originURLObject = new URL(detailConfig.origin[i].url);
    					if(originURLObject.protocol == "https"){
    						var useProtocol = https;
    					}else if(originURLObject.protocol == "http"){
    						var useProtocol = http;
    					}
    					var currentFile = detailConfig.origin[i].file_list[i].local;
    					var targetPath = path.dirname(currentFile);
    					var tempFile = __dirname + config.general.temp_directory + "/" + path.basename(currentFile);
    					var tempFileStream = fs.createWriteStream(tempFile);
    					var getRemoteFile = useProtocol.get(detailConfig.origin[i].url, function(response) {
							response.pipe(tempFileStream);
						});
						
    					if(!checkMapFileExist(targetPath)){
							createMapFile(targetPath + "/", Infinity);
    					}
    					try {
							var mapFileTemp = JSON.parse(fs.readFileSync(targetPath + "/map.servsync.json", function(err, data) {
								if (err) {
									console.log('\x1B[31m%s\x1b[0m', "Error when reading " + targetPath + "/map.servsync.json");
								}
							}));
							currentMapFile = mapFileTemp;
						} catch(e) {
							console.log('\x1B[31m%s\x1b[0m', "Error when parsing " + targetPath + "/map.servsync.json");
						}
    					if(checkFileExist(currentFile)){
    						var searchIndex = 0;
    						for(var k=0;k<currentMapFile.files.length;k++){
    							if(currentMapFile.files[i].name == path.basename(currentFile)){
    								break;
    							}else{
    								searchIndex++;
    							}
    						}
    						var originHash = currentMapFile.files[searchIndex].hash;
    						var newHash = hash(tempFile);
    						if(originHash != newHash){
    							var doWriteFile = true;
    							fs.unlink(tempFile);
    						}else{
    							fs.unlinkSync(targetPath + "/" + currentMapFile.files[searchIndex].name);
    						}
    					}else{
    						var doWriteFile = true;
    					}
    					if(doWriteFile){
    						fs.copyFileSync(tempFile,targetPath + "/" + currentMapFile.files[searchIndex].name);
    						fs.unlink(tempFile);
    						currentMapFile.files[searchIndex].hash = newHash;
    					}
    				}
    			}else{
					for(var j=0;j<detailConfig.origin[i].file_list.length;j++){
    					var originURLObject = new URL(detailConfig.origin[i].url);
    					if(originURLObject.protocol == "https"){
    						var useProtocol = https;
    					}else if(originURLObject.protocol == "http"){
    						var useProtocol = http;
    					}
    					var currentFile = detailConfig.origin[i].file_list[i].local;
    					var targetPath = path.dirname(currentFile);
    					var fileStream = fs.createWriteStream(currentFile);
    					var getRemoteFile = useProtocol.get(detailConfig.origin[i].url, function(response) {
							response.pipe(tempFileStream);
						});
    					if(!checkMapFileExist(targetPath)){
							createMapFile(targetPath + "/", Infinity);
    					}
    					try {
							var mapFileTemp = JSON.parse(fs.readFileSync(targetPath + "/map.servsync.json", function(err, data) {
								if (err) {
									console.log('\x1B[31m%s\x1b[0m', "Error when reading " + targetPath + "/map.servsync.json");
								}
							}));
							currentMapFile = mapFileTemp;
						} catch(e) {
							console.log('\x1B[31m%s\x1b[0m', "Error when parsing " + targetPath + "/map.servsync.json");
						}
    				}
    			}
    		}else{
    			if(detailConfig.origin[i].checkHash){
    				for(var j=0;j<detailConfig.origin[i].file_list.length;j++){
    					
    				}
    			}else{
    				for(var j=0;j<detailConfig.origin[i].file_list.length;j++){
    					
    				}
    			}
    		}
    	}
    	nextRecursion = setTimeout(syncLoop, config.general.loop_interval);
	})();
}
syncLoopBridge();

function hash(file){
  var testFile = fs.readFileSync(file);
  var sha1sum = crypto.createHash('sha1').update(testFile).digest("hex");
  return sha1sum;
}

function checkFileExist(target){
	try {
		if(fs.existsSync(target)) {
			return true;
		}else{
			return false;
		}
	}catch(err) {
		return false;
	}	
}
function checkMapFileExist(folder){
	return checkFileExist(folder + "map.servsync.json");
}

function encrypt(plainText, key, outputEncoding = "base64") {
    const cipher = crypto.createCipheriv("aes-128-ecb", key, null);
    return Buffer.concat([cipher.update(plainText), cipher.final()]).toString(outputEncoding);
}

function decrypt(cipherText, key, outputEncoding = "utf8") {
	cipherText = Buffer.from(cipherText, "base64");
    const cipher = crypto.createDecipheriv("aes-128-ecb", key, null);
    return Buffer.concat([cipher.update(cipherText), cipher.final()]).toString(outputEncoding);
}

function updateMapFile(folder,encrypt_key){
	var folderFileList = fs.readdirSync(folder);
	try {
		var readMapFile = JSON.parse(fs.readFileSync(__dirname + folder + "map.servsync.json" , function(err, data) {
			if (err) {
				console.log('\x1B[31m%s\x1b[0m', "Error when reading " + folder + "map.servsync.json");
			}
		}));
		var mapToBeUpdate = readMapFile;
	} catch(e) {
		console.log('\x1B[31m%s\x1b[0m', "Error when parsing " + folder + "map.servsync.json");
	}
	if(config.general.encrypt_enabled){
		
	}
	for(var i=0;i<mapToBeUpdate.files.length;i++){
		if(!checkFileExist(folder + mapToBeUpdate.files[i].name) || !pathType(folder + mapToBeUpdate.files[i].name)){
			mapToBeUpdate.files.remove(i);
		}
	}
	for(var i=0;i<mapToBeUpdate.folders.length;i++){
		if(!checkFileExist(folder + mapToBeUpdate.files[i].name) || pathType(folder + mapToBeUpdate.files[i].name)){
			mapToBeUpdate.folders.remove(i);
		}
	}
	for(var i=0;i<folderFileList.length;i++){
		if(pathType(folder + folderFileList[i])){
			if(mapToBeUpdate.indexOfN(folderFileList[i]) == -1){
				detectedNewFile = {
					"name":folderFileList[i],
					"hash":hash(folder + folderFileList[i]),
					"version":config.general.default_verstamp
				};
				if(general.encrypt_enabled){
					
				}
				mapToBeUpdate.files.push(detectedNewFile);
			}
		}else{
			if(mapToBeUpdate.indexOfN(folderFileList[i]) == -1){
				mapToBeUpdate.folders.push(folderFileList[i]);
			}
		}
	}
	fs.writeFile(folder + "map.servsync.json", JSON.stringify(mapToBeUpdate), function(err) {
		if(err) {
			console.log("Failed to update map.servsync.json at " + folder);
		}
		console.log("Updated map.servsync.json at " + folder);
	}); 
}
function createMapFile(folder, version, code){
	var folderFileList = fs.readdirSync(folder);
	mapData = {
		"encryption":config.general.encrypt_enabled,
		"files":[],
		"folders":[]
	};
	for(var i=0;i<folderFileList.length;i++){
		if(pathType(folderFileList[i])){
			mapData.files.push(
			{
				"name":folderFileList[i],
				"hash": hash(folder + "/" + folderFileList[i]),
				"version": version,
			});
		}else{
			mapData.folders.push(
			{
				"name":folderFileList[i]
			});
		}
	}
	fs.writeFile(folder + "map.servsync.json", JSON.stringify(mapData), function(err) {
		if(err) {
			return console.log(err);
		}
		console.log("Created map file at" + folder);
	});
}
function convertKey(code){
	if(code.length >= 16){
		return code;
	}else{
		return crypto.createHash('sha1').update(code).digest("base64").slice(0,16);
	}
}
function pathType(path){
	return fs.statSync(path).isFile();
}
function moduleAvailable(name) {
    try {
        require.resolve(name);
        return true;
    } catch(e){}
    return false;
}

function readJSONFile(path){
	try {
		var dataFromFile = JSON.parse(fs.readFileSync(path, function(err, data) {
		if (err) {
			console.log('\x1B[31m%s\x1b[0m', "Error when reading " + path);
		}
	}));
	} catch(e) {
		console.log('\x1B[31m%s\x1b[0m', "Error when parsing " + path);
		return {"isSuccess":false,"data":null};
	}
	return {"isSuccess":true,"data":dataFromFile};
}
