/**
 * Utility functions that can be useful across applications
 */
define([],function($) {
	/*
	 * Retrieves the value of a url parameter from the query string
	 * @param name the name of the parameter to retrieve
	 * @returns the string value or null if not exist
	 */
	var getUrlParameter = function(name) {
	    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
	}
	
	return {
		getUrlParameter: getUrlParameter
	};
});