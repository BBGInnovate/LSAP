/**
 * A configuration object that should be passed to the bbgPlayer during initialization.  
 * This allows for the external URLs and other constants to be defined easily. 
 * It also means that a different configuration can be passed to the same code file.
 */

define({
	embedPlayer: 'http://ec2-174-129-178-122.compute-1.amazonaws.com/ovap/LSAP/mbn/embed.php',
	popoutPlayer: null,
	metadataRemoteService: 'http://ec2-174-129-178-122.compute-1.amazonaws.com/ovap/LSAP/metadata/remote.streaminfo.php', //url to remote file that reads metadata - should be on same domain as it uses json
	configFolder: 'http://ec2-174-129-178-122.compute-1.amazonaws.com/ovap/LSAP/mbn/config/',
	styleFolder: 'http://ec2-174-129-178-122.compute-1.amazonaws.com/ovap/LSAP/mbn/css/',
	trackIncrement: 30, // number of seconds in between duration tracking calls
	trackEventCategory: 'Live Audio Streaming Player'
});