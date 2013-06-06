<?php 
/**
 * To be called by ajax calls to get streaming info from a Shoutcast/Icecast server.
 * 
 * REQUIRES:
 * url.l		The location to retrieve streaming data from
 * 
 * RETURNS:
 * json encoded object:
 * 		success:	true or false
 * 		message:	populated if success = false
 * 		metadata:	populated if success = true
 */
error_reporting(E_ALL);
ini_set('display_errors', '1');

require_once("class.streaminfo.php");

$results = array('success'=>'false','message'=>'','metadata'=>'');
if (!isset($_GET['l']) || strlen(trim(urldecode($_GET['l']))) == 0) {
	$results['message'] = 'No location data specified for stream.';
} else {
	$location = trim(urldecode($_GET['l']));
	$info = new streaminfo($location);
	$results['success'] = 'true';
	$results['metadata'] = array(
		'streamtitle' => $info->streamtitle,
		'station' => $info->icyname,
		'genre' => $info->icygenre,
		'stationurl' => $info->icyurl
	);
}
echo(json_encode($results));
?>