/*global google, console, ko, $, _, Place, StreetView */
(function () {
  'use strict';
  
  /* main app ViewModel
     connects together components of application */
  function AppViewModel(placeOptions) {
    var self = this;
    
    this.placesRequestOptions = placeOptions;
    
    this.allPlaces = [];
    this.filteredPlaces = ko.observableArray([]);
    this.selectedPlace = ko.observable(null);
    this.searchQuery = ko.observable();
    this.errors = ko.observableArray([]);
    
    this.anyErrors = ko.computed(function () {
      return self.errors().length > 0;
    });
    
    /* filter places when search query changes */
    this.searchQuery.subscribe(this.filterPlaces, this);
    /* debounce search */
    this.searchQuery.extend({ rateLimit: 100 });
    
    /* listen for an event when map connects */
    this.listenForMap();
    
    /* initialize Street View API object */
    this.streetViewAPI = new StreetView();
  }
  
  AppViewModel.prototype = {
    constructor: AppViewModel,
    
    /* handle request to Google Places API */
    populatePlaces: function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        var places = this.createPlacesFromJSON(results);
        this.allPlaces = places;
        this.filteredPlaces(places);
      } else {
        this.errors.push('Unable to get places');
      }
    },
    
    /* request Google Places API for some places */
    loadPlaces: function (map) {
      this.placesAPI = new google.maps.places.PlacesService(map);
      this.placesAPI.search(this.placesRequestOptions, this.populatePlaces.bind(this));
    },
    
    /* perform actions when map initializes 
       params is an object with map property, holding reference to
       google.maps.Map object */
    mapInitialized: function (event, params) {
      this.loadPlaces(params.map);
    },
    
    /* listen for an event when map connects */
    listenForMap: function () {
      $(document).on('map.initialized', this.mapInitialized.bind(this));
    },
    
    /* open place view */
    goToPlace: function (place) {
      this.selectedPlace(place);
    },
    
    /* close place view */
    getOut: function () {
      this.selectedPlace(null);
    },
    
    /* matches place to query */
    placeFilter: function (place, query) {
      return place.title.toLowerCase().search(query.toLowerCase()) > -1;
    },
    
    /* filter places using search query */
    filterPlaces: function (query) {
      this.filteredPlaces(_.filter(this.allPlaces, function (place) { return this.placeFilter(place, query); }, this));
    },
    
    /* create Place objects from json data */
    createPlacesFromJSON: function (json) {
      return _.map(json, function (placeData) { return new Place(placeData, this); }, this);
    }
  };
  
  function init() {
    /* some options to get places nearby */
    var placeOptions = {
      location: new google.maps.LatLng(45.039717, 38.974496),
      radius: 1000,
      types: ['bar', 'bakery', 'book_store', 'cafe', 'food', 'gym', 'hair_care']
    };
    
    /* StreetView component takes place object and 
       StreetView api object as params,
       performs request to StreetView API and shows
       received image */
    ko.components.register('street-view', {
      viewModel: {
        createViewModel: function (params, componentInfo) {
          function StreetViewModel() {
            var api = params.api;
            
            this.place = params.place;
            this.posterUrl = ko.observable(api.getImageUrlFor(this.place));
          }
          
          return new StreetViewModel();
        }
      },
      template: { element: 'street-view.html' }
    });
    
    /* Errors component keeps track of application errors */
    ko.components.register('errors', {
      viewModel: {
        createViewModel: function (params, componentInfo) {
          function ErrorsViewModel() {
            this.errors = params.errors;
            if (params.modal) {
              $(componentInfo.element).addClass('modal');
            }
          }
          
          return new ErrorsViewModel();
        }
      },
      template: { element: 'errors.html' }
    });
    
    /* just a filter to display date. Takes value of date in seconds */
    ko.bindingHandlers.date = {
      init: function (element, valueAccessor) {
        /* we get date in seconds so we need to transform it into ms */
        var date = new Date(valueAccessor() * 1000);
        
        $(element).text(date.toDateString());
      }
    };
    
    ko.applyBindings(new AppViewModel(placeOptions));
  }
  
  document.addEventListener('DOMContentLoaded', init);
}());