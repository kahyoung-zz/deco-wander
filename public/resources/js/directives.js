'use strict';

/* Directives */


angular.module('WanderApp.directives', ['ngCookies']).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  .directive('fbButton',['Facebook', '$cookies', function(FB, $cookies){
  	return {
            restrict: 'E',
            template: '<a href="#">Login to Facebook</a>',
            link: function(scope, element, attrs) {
            	element.bind('click', function(e) {
            		FB.getLoginStatus(function(response) {
            			console.log(response);
            			if(response.status === 'connected') {
            				window.location.href = '/wander/callback?access_token='+ response.authResponse.accessToken;
            			} else {
            				FB.login(function(response) {
            					if(response.authResponse) {
									$cookies[response.authResponse.userID] = response.authResponse.accessToken;
									$cookies["wauserId"] = response.authResponse.userID;

									window.location.href = '/wander/callback?access_token='+ response.authResponse.accessToken;
								}
            				});
            			}
            		});
            	});
           }
       }
  }])
  .directive('angularProcessing', function($compile) {
   return function(scope, iElement, iAttr){
        scope.$processing = new Processing(iElement[0], scope[iAttr.angularProcessing]);
   };
 });
