[jPlayer]: http://www.jplayer.org/
[jPlayer_media]: http://jplayer.org/latest/developer-guide/#jPlayer-setMedia
[jPlayer_options]: http://jplayer.org/latest/developer-guide/#jPlayer-options
[jPlayer_audio]: http://jplayer.org/latest/developer-guide/#reference-html5-audio-format
[jPlayer_devguide]: http://jplayer.org/latest/developer-guide/
[google_smtracking]: https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingSocial
#BBG Live Streaming Audio Player
The BBG Live Streaming Audio Player is created as a jQuery plugin that extends the capabilities of [jPlayer][jPlayer].  The player can play a simple single live stream or allow the end user to choose from a list of available streams.  The player accepts a large number of initialization parameters to govern the behavior.  Many of these can be passed in via a single configuration xml file to allow for simple standard configurations per entity or per channel.  This also allows for some localization and translation capabilities.  The configuration file can also specify instance-specific CSS files to be loaded to allow the player to be completely re-skinned for different entities and usages.

##Options
* overrideStream:  A single [media object][jPlayer_media] to be played via the jPlayer plugin
* config: A configuration file to load
* playerOpts: A JSON object of options to be passed directly to jPlayer.  See [options list][jPlayer_options].  *Default: empty object*
* bbgCssSelectors: A JSON object of jQuery selectors to be used to access BBG specific page elements
* -title: where the song title should be displayed *Default: .jp-song*
* -station: where the station should be displayed *Default: .jp-station*
* -share: a share link (or button) to embed the player *Default .jp-share*
* -sharePanel: the panel to open when the player is being embedded.   This panel should include a textarea with a class of "jp-share-code" where the embed code is displayed and a button with the class "share-hide" to hide the share panel.  *Default: .jp-share-panel*
* -streams: access the stream component (can be either a select or ul) *Default .jp-streams*
* pop: link to "pop" the player from the page so that the user can continue to navigate around a site while listening *Default .jp-pop*
* -poster: location to display any relevant poster art *Default .jp-poster*
* -loading: location to display a loading graphic *Default .jp-loading*
* -statusConnecting: shows when the player is connecting *Default: .jp-status-connecting*
* -statusStreaming: shows when the player is streaming *Default: .jp-status-streaming*
* -statusPaused: shows when the player is paused *Default: jp-status-paused*
* -statusEnded: shows when the player is ended *Default: jp-status-ended*
* -social: holds social sharing icons *Default: .jp-social*
* -brandingLink: Tag to populate with branding link (should be an anchor tag) *Default: .bbg-player-branding a*
* -footer: Holds footer content *Default: #footer*
* embedded: boolean to indicate if the player being shown is embedded from share functionality. *Default: false*
* popped: boolean to indicate if the player being shown is a "popped" player. *Default: false*
* streamListComponent: indicates the type of component used to display streams.  Current valid values are "select" and "ul".  *Default: ul*

The following options can be passed from the ]configuration file:

* labels: A JSON object of labels that can be added dynamically
* -selectStream: The message to display within the top select option to indicate to the user to select a station.  *Default: Select a station:*
* locale: The locale code.  Currently only used to localize Twitter share button, but could be used in further versions.  *Default: en_US*
* trackingEnabled: boolean to indicate if Google Analytics tracking is enabled for this player.  This requires that the proper account tracking script is already included on the player HTML page.  *Default: false*
* metadataStreamEnabled: boolean to indicate that the player should read station/song metadata directly from the stream.  *Default: false*
* metadataCheckInternal: How often to check the stream interval in seconds.   *Default: 10*
* overrideTitle: an override title to display rather than dynamic song options.  *Default: null*
* autoplay: boolean to indicate if the player should start playing automatically.  *Default: true*
* showSiteUrl: boolean to indicate if the site url should be shown along with the station name.  *Default: false*
* showPosters: boolean to indicate if artwork should be shown.  *Default: true*
* social:  a listing of options for social media sharing
* -shareLink: an override link to be shared.  *Default: The page that loaded the player (or the iframe)*
* -facebook: Facebook options
* ---enabled: boolean to indicate if Facebook sharing is enabled.  *Default: true*
* -twitter: Twitter options
* ---enabled: boolean to indicate if Twitter sharing is enabled.  *Default: true*
* -email: Email options
* ---enabled: boolean to indicate if email sharing is enabled. *Default: true*
* ---subject: subject to pre-populate.  *Default: Live Radio*
* ---body: body to pre-populate (will have link appended to end after line break).  *Default:  I wanted to share this online radio station with you.*
* -embed: Share/Embed options
* ---enabled: boolean to indicate if embedding is enabled.  *Default: true*
* ---instructions: the instructions text to display when sharing.  *Default: Copy the following to embed the player.*
* ---hide: the value to display of the hide button.  *Default: Hide*
* brandingLink: A link to show in the brandingLink selector anchor to allow linking back to the main player site.  *Default: null*
* footerContent: HTML content to display within the player footer.  *Default: <p>A BBG Player</p>*

##Hard-code Constant Values
The bbgPlayer uses the following constants that are defined at beginning of the code in the self.config object:

* embedPlayer: The absolute url to the page to use as the embedded player
* popoutPlayer: The absolute url to the page to use as the popped player
* metadataRemoteService: The absolute url to the location for the metadata remote service PHP class code.  This is the server-side code that retrieves metadata information from a strem
* configFolder: the folder where configuration files are stored
* styleFolder: the folder where stylesheets are stored
* trackIncrement: The number of seconds in between duration tracking calls
* trackEventCategory: The event category to use for Google Analytic event tracking
* facebookAppId: The ID of the Facebook application created for the like button.  While a simple button does not require an official Facebook application ID, implementation tracking of likes does.

##Configuration Files
Configuration files information is passed to the player as the filename only (without file extension).  The player then looks for the files in the folder defined in the configuration constants.  For example, if the configuration passed to the player was "myConfig" and the configuration folder was defined as "http://sampledomain.com/configfiles/" then the player would look for a file in http://sampledomain.com/configfiles/myConfig.xml.

The configuration xml has a <playerconfig> root node and three child nodes:

* streams: Defines the streams to be played
* styles: Defines the stylesheets to be loaded specific to this player
* config: Defines the overriding options for initialization of the bbgPlayer

###Streams
The streams node must contain at least one child <item> node.  A sample item node is:

	<item channelid="1234" type="live">
		<streamUrl format="mp3">http://sc9.iad.llnw.net/stream/npr_music2</streamUrl>
		<title>The Most Awesome</title>
		<description />
		<siteUrl>http://ourawesomewebapp.com</siteUrl>
	</item>
    
* The channel id attribute can be any alphanumeric characters but must be unique across streams.
* The type is not currently in use.
* The stream url is the full URL to the site to stream for each format.  There must be at least one streamUrl specified for each stream.  If multiple formats are to be supported, then each item must include all formats.  Valid values for the formats are mp3, m4v, and oga.  Refer to [jPlayer audio formats][jPlayer_audio] for more information.
* The title is the title to display and track.  This will be overwritten by dynamic metadata if enabled.
* The description is not currently in use but can be used to display additional station information.
* The siteUrl is the link to the station that is displayed within the station information.
* Each item can additionally have nodes for poster (the poster image to display for the channel if enabled).
* Each item can have child nodes for titleImage, titleImageHover, and titleImageSelect to handle displaying an image in place of station text for stream lists.  This is what is used to power the MBN flag navigation.

###Styles
The styles node can contain zero or more child <stylesheet> nodes.  The text of the stylesheet node defines the station specific CSS file to include.  The location is specified in the player constants.  An example stylesheet node is: 

    <stylesheet>station.css</stylesheet>
    
####Config
The config node is where player initialization options can be overwritten to allow for a customized experience for each station as well as localization support.  Each node specified must have a corresponding player option defined.  For player options defined with a value of a JSON object, the object properties becomes the names of child nodes.  For example, the social option could be specified in config xml as:

	<social>
		<shareLink>http://www.voanews.com</shareLink>
		<facebook>
			<enabled>true</enabled>
		</facebook>
		<twitter>
			<enabled>true</enabled>
		</twitter>
		<email>
			<enabled>true</enabled>
			<subject>Live Radio</subject>
			<body>I wanted to share this online radio station with you.</body>
		</email>
		<embed>
			<enabled>true</enabled>
			<instructions>Copy the following to embed the player:</instructions>
			<hide>Hide</hide>
		</embed>
	</social>
	
###Resources
* [jPlayer Developer Documentation][jPlayer_devguide]
* [Google Analytics Social Media Tracking][google_smtracking]

##Example Configuration File
	<?xml version="1.0"?>
	<playerconfig>
		<streams>
			<item channelid="jordan" type="live">
				<streamUrl format="mp3">http://sc9.iad.llnw.net/stream/npr_music2</streamUrl>
				<title>The Most Awesome</title>
				<description />
				<siteUrl>http://ourawesomewebapp.com</siteUrl>
			</item>
		</streams>
		<styles>
			<stylesheet>station.css</stylesheet>
		</styles>
		<config>
			<brandingLink>http://www.voanews.com</brandingLink>
			<labels>
				<selectStream>EDITED: Select a station:</selectStream>
			</labels>
			<trackingEnabled>true</trackingEnabled>
			<metadataStreamEnabled>true</metadataStreamEnabled>
			<metadataCheckInterval>10</metadataCheckInterval>
			<autoplay>false</autoplay>
			<showSiteUrl>true</showSiteUrl>
			<showPosters>true</showPosters>
			<social>
				<shareLink>http://www.voanews.com</shareLink>
				<facebook>
					<enabled>true</enabled>
				</facebook>
				<twitter>
					<enabled>true</enabled>
				</twitter>
				<email>
					<enabled>true</enabled>
					<subject>Live Radio</subject>
					<body>I wanted to share this online radio station with you.</body>
				</email>
				<embed>
					<enabled>true</enabled>
					<instructions>Copy the following to embed the player:</instructions>
					<hide>Hide</hide>
				</embed>
			</social>
		</config>
	</playerconfig>