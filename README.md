# Under Construction

 Servsync is not ready for use.

# Servsync

 Sync folders and files between your servers.


## as Slave

 Automatically sync files from a origin or server that is running another instance of Servsync

 for details of Servsync as Master, see __as Master__ 

### Origin Mode

 You can determine a origin to download.

 This will be executed at the first.

### Auto Mode

 You can determine a directory with URL, and Servsync will automatically sync from it using map.servsync.json

 The target URL's server must be running Servsync at that directory as Master.

 This will be executed after origin is pulled.

### Custom Map Mode

 You can customize map.servsync.json to indicate what files to sync.


 This will be executed at last

## as Master

 You can set what folders or certain files to sync, for folders, Servsync will automatically generate a Map File to tell Slave Servers what to download.

 A server could be Master and Slave in the meantime, You can set files a VersionStamp, to ensure that the newest file is synced.

 For first time, files will be initalized with a VersionStamp of 1.


## Encryption

 If you don't want others to discover map.servsync.json, you can enable encryption and assign a encryption key, to ensure only authorized people can access map.servsync.json

 Please don't forget to change default encryption key.

 If the master server enabled encryption, you must config it locally.

## Servsync API Server

 After you run Servsync, Servsync will start a local server at 127.0.0.1:1212(default)

 This server provided several APIs that is quite important.

 Please still don't forget to change the default API Token

### Servsync API Standard

 Servsync accept JSON-formatted data.


#### changeInFolderVerStamp

 > Input {"token":[Your token],"folder":[path],"value":[Value you want]}
 > Return {"status":[See below]}

status:200 - Successfully executed. 

status:300 - Cannot find map file.

 status:401 - API Token error.

 HTTP 400 - Parsing Error.

 Example of sending a request to Servsync Server

 >$.ajax({
 >type: 'POST',
 >url: '/changeInFolderVerStamp',
 >data: '{"token":"1145141919","folder":"/var/wwwroot/tobechanged","value":3}',
 >success: function(data) { alert('reply: ' + data); },
 >contentType: "application/json",
 >dataType: 'json'
 >});
 >####/changeFileVerStamp
 > This API change VerStamp of a certain file to a certain value.
 >Input {"token":[Your token],"file":[file path],"value":[Value you want]}
 >Return {"status":[See below]}

status:200 - Successfully executed. 

status:300 - Cannot find file.

 status:401 - API Token error.

 HTTP 400 - Parsing Error.

 #### /syncStatus

 This API return if sync loop is being executing.

 > Input {"token":[Your token]}
 > Return {"status":[See below]}

status:200 - Sync loop is being executing.

 status:201 - Sync loop is stopped.

 status:401 - API Token error.

 HTTP 400 - Parsing Error.

 #### /syncLoop

 This API start or stop sync loop

 > Input {"token":[Your token],"mode":"[start/pause]"}
 > Return {"status":[See below]}

 status:200 - Success 

status:201 - Sync loop status is already [start/pause]

 status:401 - API Token error.

 HTTP 400 - Parsing Error.
**For details about configuring Servsync, see config.json as a example.**