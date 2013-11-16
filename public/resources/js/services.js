'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('WanderApp.services', []).
  factory('Facebook', ['$rootScope', '$window', '$cookies', '$location', '$http', function($rootScope, $window, $cookies, $location, $http) {
	  //get FB from the global (window) variable.
    var FB = $window.FB;

    //Store information about the application here
    var appId = "568077023249265";
  	var appSecret = "86a2efda2032238a960e70fe3e825bdf";
    var FBscope = ['user_about_me,user_activities,user_birthday,user_checkins,user_education_history,user_events,user_groups,user_hometown,user_interests,user_likes,user_location,user_notes,user_photos,user_questions,user_relationships,user_relationship_details,user_religion_politics,user_status,user_subscriptions,user_videos,user_website,user_work_history,friends_about_me,friends_activities,friends_birthday,friends_checkins,friends_education_history,friends_events,friends_groups,friends_hometown,friends_interests,friends_likes,friends_location,friends_notes,friends_photos,friends_questions,friends_relationships,friends_relationship_details,friends_religion_politics,friends_status,friends_subscriptions,friends_videos,friends_website,friends_work_history'];
    var domain = 'http://wander-int.herokuapp.com';
    var uri = encodeURI(domain+'/#/app');
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
        // Do
      } else {
        if($location.path() != '/login') $rootScope.$apply($location.path('/login'));
      }
    });

    function sortByType(experiences){
      var checkins = [];
      var photos = [];
      var statuses = [];
      var returnObject = {};
      for (var i = experiences.length - 1; i >= 0; i--) {
        switch(experiences[i].type) {
          case 'checkin' :
            checkins.push(experiences[i].id);
            break;
          case 'photo' :
            photos.push(experiences[i].id);
            break;
          case 'status' :
            statuses.push(experiences[i].id);
            break;
          default:
            console.log(experiences[i].type);
            break;
        }
      };
      returnObject['checkins'] = checkins;
      returnObject['photos'] = photos;
      returnObject['statuses'] = statuses;

      return returnObject;
    }

    function getExtendedInformation(sorted, callback) {
      FB.api({
        method: 'fql.multiquery',
        queries: {
          'checkins' : 'SELECT author_uid, checkin_id, message FROM checkin WHERE checkin_id IN (' + sorted.checkins + ')',
          'photos' : 'SELECT owner, place_id, src, src_big, pid, src_big_width, src_big_height FROM photo WHERE object_id IN (' + sorted.photos + ')',
          'statuses' : 'SELECT uid, place_id, message FROM status WHERE status_id IN (' + sorted.statuses + ')',
          'places' : 'SELECT page_id, name, is_city, display_subtext FROM place WHERE page_id IN (SELECT place_id FROM #photos)'
        }
      }, callback);
    }

    function getUserAndPlaceInformation(experience, callback) {
      if(experience.owner && experience.place_id) {
        FB.api({
          method: 'fql.multiquery',
          queries: {
            'user' : 'SELECT nameFROM checkin WHERE checkin_id IN (' + sorted.checkins + ')',
            'place' : 'SELECT owner, place_id, src, src_big, pid FROM photo WHERE object_id IN (' + sorted.photos + ')'
          }
        }, callback);
      }
    }
    // Return function which in turn calls the Facebook JavascriptSDK
    return {
        // Allows for custom calling of the GraphAPI
        api: function(path, callback) {
          FB.api(path, callback);
        },
        fql: function(fql, callback) {
          FB.api('fql', { q : fql }, callback);
        },
        getUser: function(user, callback) {
          FB.api('/' + user +'?fields=name,picture', callback)
        },
        getPlace: function(place, callback) {
          FB.api('/' + place + '?fields=name', callback);
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
          FB.login(callback, FBscope);
        },
        getRedirectURL : function() {
          return domain;
        },
        loginNoPopup : function(callback) {
          FB.getLoginStatus(function(response) {
              if (response.status === 'connected') {
                  window.location.href=uri;
              } else {
                  window.location = encodeURI("https://m.facebook.com/dialog/oauth?client_id="+appId+"&redirect_uri="+domain+"&display=popup&scope="+FBscope);
              }
          });
        },
        logout : function() {
          FB.logout(function(response){
            window.location= encodeURI(domain);
          });
        },
        getPlacesByLatLngAndKeywords: function(lat, lng, keywords, callback) {
          if(!keywords) keywords = '';
          var query = encodeURI('/search?type=place&q='+keywords+'&fields=id,name&center='+lat+','+lng+'&limit=25');
          FB.api(query, callback);
        },
        getFriendsPhotosFromPlace : function(place, callback) {
          FB.api('/search?type=location&place=' + place + '&fields=type,id', function(response) {
            response.place = place;
            callback(response);
          });
        },
        getPhotosFromPlace : function(place, limit, callback) {
          if(!limit) limit = 24;
          var query = "SELECT object_id, src, src_big, images, owner, src_big_width, src_big_height FROM photo WHERE owner = " + place + ' LIMIT ' + limit;
          this.fql(query, function(response) {
            response.place = place;
            callback(response);
          });
        },
        getPhotoSourceById : function(ids, callback) {
          var query = "SELECT object_id, src, src_big, images, owner FROM photo WHERE object_id IN (" + ids + ")";
          this.fql(query, callback);
        },
        getMorePhotosFromPlace : function(place, offset, callback) {
          var query = "SELECT object_id, src, src_big, images, owner FROM photo WHERE owner = " + place + ' LIMIT 24 OFFSET ' + offset;
          this.fql(query, function(response) {
            response.place = place;
            callback(response);
          });
        },
        getFriendsCheckedIn : function(place, callback) {
          FB.api(place+'/checkins?fields=from.id', callback);
        },
        sortExperiencesByType : function(experiences) {
          return sortByType(experiences);
        },
        getExtendedInformation : function(sorted, callback) {
          getExtendedInformation(sorted, callback);
        }
    }
  }])
  .service('Location', function() {
    var region;

    return {
      setRegion : function (_region) {
        region = _region;
      },
      getRegion : function() {
        return region;
      }
    }
  })
  .service('Reccommender', ['$rootScope', '$window', '$cookies', '$location', function($rootScope, $window, $cookies, $location) {
    /*
    *
        This service should, when given a list of variables, be able to return the most favourable results for the user supplied
        It must be supplied:
          The user variable
            an array of information about the user
          The locationInformation variable
            an array of posts, likes, comments, photos etc that have been taken at a location
        The following functions will be available"
            user (get/set)
            locationInformation (get/add/clear)
            recommendations(get)
    */

    var user;
    var reccommendations;
    var userInterests = [];
    var locationInformation = [];
    var categories = ['FOOD', 'LIFESTYLE', 'FAMILY'];

    for (var i = categories.length - 1; i >= 0; i--) {
      var catName = categories[i];
      userInterests.add({catName : 0});
    };

    function determineCategory(item) {
      var itemCategory;
      return itemCategory;
    }
    function assignPoints(item) {
      /*
      *   TODO  - Determine which category the item is in
                - Determine if it's positive or negative
                - Assign points based on the positive or negative

          The working method behind generating a user interests

          This algorithm, when given the JSON object of a user, will determine what the user likes in terms of categories
          The algorithm will work in the following way:
            While analyzing the user's information (a limit of 50), each time a certain category is brought up, that category is assigned a point
            These points are assigned based on:
              Whether the experience was good (+5)
              Whether the user had an experience (+2)
              Whether the experience was bad (0)
            Once these points have been allocation, the user's interest will be assigned to the userInterest variable in the format:
            [ 
              { category : point }, 
              { category : point }, 
              { category : point }
            ]
      */
      var assigniedCategory = this.determineCategory(item);
      var point = 0;
      var isPositive = true;

      // If item contains keywords, then assign category to CATEGORY
      // Then determine keywords for pos/neg assosciation

      // Assign that category with the point
      userInterests[assignedCategory] += point;
    }

    function generateUserInterests(userInfo) {
      // TODO - Create algorithm to determine a user's interests
      /* 
      * This method parses in the user's information and gets it ready to be determined by the determineCategoryAndAssignPoints function
        
      */
      userInterests = userInfo;

    }

    function generateReccommendations(locationInfo) {
      // TODO - Create algorithm to determine a reccomendations for a location
      var locationInfoCategory = this.determineCategory(locationInfo);
      reccomendations.add(locationInfo);
    }

    //Functions for this service
    return {
        getUser : function() {
          return user;
        },
        setUser : function(newuser) {
          user = newuser;
          generateUserInterests(user);
        },
        clearUser : function() {
          // Delete user variable
          userInterests = [];
        },
        getLocationInformation : function() {
          return locationInformation;
        },
        addLocationInformation : function(information) {
          locationInformation = locationInformation.concat(information);
          generateReccommendations(locationInformation);
        },
        clearLocationInformation : function() {
          locationInformation = [];
          reccomendations = [];
        },
        getReccommendations : function() {
          return reccommendations;
        }
    }
  }]);
