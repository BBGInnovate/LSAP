/**
 * A configuration object that should be passed to the bbgPlayer during initialization.  
 * This allows for the external URLs and other constants to be defined easily. 
 * It also means that a different configuration can be passed to the same code file.
 */

define({
	embedPlayer: null,
	popoutPlayer: null,
	metadataRemoteService: 'http://ec2-174-129-178-122.compute-1.amazonaws.com/ovap/LSAP/metadata/mbn/remote.streaminfo.php', //url to remote file that reads metadata - should be on same domain as it uses json
	configFolder: 'http://ec2-174-129-178-122.compute-1.amazonaws.com/ovap/LSAP/mbn/config/', // absolute url including trailing slash
	styleFolder: 'http://ec2-174-129-178-122.compute-1.amazonaws.com/ovap/LSAP/mbn/css/', // absolute url including trailing slash
	jplayerSwfLocation: '/ovap/LSAP/mbn/js', // should be relative to the web root and not contain a trailing slash
	// these should not be changed without consulting with data analyst
	trackIncrement: 30, // number of seconds in between duration tracking calls
	trackEventCategory: 'Live Audio Streaming Player' // Category tracked within GA account
});