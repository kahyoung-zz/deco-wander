'use strict';


// Declare app level module which depends on filters, and services
angular.module('WanderApp', ['WanderApp.filters', 'WanderApp.services', 'WanderApp.directives', 'ngCookies']).
  run(['$rootScope', '$cookies', '$location', 'Facebook', function($rootScope, $cookies, $location, Facebook) {
   
  }]);
