'use strict';


// Declare app level module which depends on filters, and services
angular.module('WanderApp', ['WanderApp.filters', 'WanderApp.services', 'WanderApp.directives', 'ngCookies']).
  config(['$routeProvider', function($routeProvider) {
  	$routeProvider.when('/login', {templateUrl: '/resources/partials/login.html', controller: LoginCtrl});
  	$routeProvider.when('/app', {templateUrl: '/resources/partials/app.html', controller: SketchCtrl});
  	$routeProvider.otherwise({redirectTo: '/login'});
  }]);;
