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
 
**For details about configuring Servsync, see config.json as a example.**