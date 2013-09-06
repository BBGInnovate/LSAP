The "remote.streaminfo.php" and "remote.airtime.php" scripts return stream metadata to update the player.
If your server has PHP installed you can change the configuration file "js/jquery.bbgPlayer.config.mobile.js" to point to the metadata scripts on your server.

For example:
Change js/jquery.bbgPlayer.config.mobile.js LINE 10 (matching the domain and path to your media player)
From
	metadataRemoteService: 'http://apps.innovation-series.com/streamreader/remote.streaminfo.php',
To
	metadataRemoteService: 'http://www.example.com/metadata/remote.streaminfo.php',