'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('WanderApp.services', []).
  factory('Facebook', ['$rootScope', '$window', '$cookies', '$location', function($rootScope, $window, $cookies, $location) {
	  //get FB from the global (window) variable.
    var FB = $window.FB;

    //Store information about the application here
    var appId = "568077023249265";
  	var appSecret = "86a2efda2032238a960e70fe3e825bdf";
    var scope = {'scope': 'user_about_me,user_activities,user_birthday,user_checkins,user_education_history,user_events,user_groups,user_hometown,user_interests,user_likes,user_location,user_notes,user_photos,user_questions,user_relationships,user_relationship_details,user_religion_politics,user_status,user_subscriptions,user_videos,user_website,user_work_history,friends_about_me,friends_activities,friends_birthday,friends_checkins,friends_education_history,friends_events,friends_groups,friends_hometown,friends_interests,friends_likes,friends_location,friends_notes,friends_photos,friends_questions,friends_relationships,friends_relationship_details,friends_religion_politics,friends_status,friends_subscriptions,friends_videos,friends_website,friends_work_history'};

    // Throw error if FB does not exist (not yet instantiated)
    if(!FB) throw new Error('Facebook not loaded');

  	FB.init({
      appId      : appId,   // App ID
      status     : true,    // check login status
      cookie     : true,    // enable cookies to allow the server to access the session
      xfbml      : false    // parse XFBML
    });

    // Here we specify what we do with the response anytime authorisation event occurs. 
    FB.Event.subscribe('auth.authResponseChange', function(response) {
      if (response.status === 'connected') {
        if($location.path() != '/app') $rootScope.$apply($location.path('/app'));
      } else if (response.status === 'not_authorized') {
        if($location.path() != '/login') $rootScope.$apply($location.path('/login'));
      } else {
        if($location.path() != '/login') $rootScope.$apply($location.path('/login'));
      }
    });

    // Return function which in turn calls the Facebook JavascriptSDK
    return {
        // Allows for custom calling of the GraphAPI
        api: function(path, callback) {
          FB.api(path, callback);
        },
        // Allows for calling of the current user
        me: function(callback) {
            FB.api('/me', callback);
        },
        // Allows for calling of current user's login status
        getLoginStatus: function(callback) {
        	FB.getLoginStatus(callback);
        },
        // Calls popup of Facebook login
        login : function(callback) {
        	FB.login(callback, scope);
        }
    }
}]);
