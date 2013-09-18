'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('WanderApp.services', []).
  value('version', '0.1')

  .factory('Facebook', ['$rootScope', '$window', function($rootScope, $window) {
	//get FB from the global (window) variable.
    var FB = $window.FB;
    var appId = "568077023249265";
	var appSecret = "099e3c09ed85db354999f7ebe0289bb4";

    // gripe if it's not there.
    if(!FB) throw new Error('Facebook not loaded');

  	FB.init({
      appId      : appId, // App ID
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : false  // parse XFBML
    });
    return {
        // a me function
        me: function(callback) {
            FB.api('/me', callback);
        },
        getLoginStatus: function(callback) {
        	FB.getLoginStatus(callback);
        },
        login : function(callback) {
        	FB.login(callback);
        },
        getAppId : function() {
        	return appID;
        },
        getAppSecret : function() {
        	return appSecret;
        }
		//TODO: Add any other functions you need here, login() for example.
    }
}]);
