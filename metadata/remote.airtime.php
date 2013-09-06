<?php 
/**
 * Get JSON "live-info" API and output in the format used by LSAP player
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
//error_reporting(E_ALL);
//ini_set('display_errors', '1');
header("Access-Control-Allow-Origin: *");

$results = array('success'=>'false','message'=>'','metadata'=>'');
if (!isset($_GET['l']) || strlen(trim(urldecode($_GET['l']))) == 0) {
	$results['message'] = 'No location data specified for stream.';
} else {
	$location = trim(urldecode($_GET['l']));
	$airtime_json = file_get_contents($location);
	$airtime_data = json_decode($airtime_json, true);

	if(!empty($airtime_data)){
		$results['success'] = 'true';
		$results['metadata']['streamtitle'] = !empty($airtime_data['current']['name']) ? $airtime_data['current']['name'] : ''; 
		$results['metadata']['station'] = !empty($airtime_data['currentShow']['name']) ? $airtime_data['currentShow']['name'] : ''; 
		$results['metadata']['stationurl'] = !empty($airtime_data['currentShow']['url']) ? $airtime_data['currentShow']['url'] : ''; 
	}
}
header('Content-Type: application/json');
echo(json_encode($results));
die();
?>