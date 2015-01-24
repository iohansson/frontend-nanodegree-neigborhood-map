/*global google, console, ko, $, _, Place, GooglePlaces, StreetView */
(function () {
  'use strict';
  
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
    
    this.searchQuery.subscribe(this.filterPlaces, this);
    this.searchQuery.extend({ rateLimit: 100 });
    
    this.listenForMap();

    this.streetViewAPI = new StreetView();
  }
  
  AppViewModel.prototype = {
    constructor: AppViewModel,
    
    populatePlaces: function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        var places = this.createPlacesFromJSON(results);
        this.allPlaces = places;
        this.filteredPlaces(places);
      } else {
        this.errors.push('Unable to get places');
      }
    },
    
    loadPlaces: function (map) {
      this.placesAPI = new google.maps.places.PlacesService(map);
      this.placesAPI.search(this.placesRequestOptions, this.populatePlaces.bind(this));
    },
    
    mapInitialized: function (event, params) {
      this.loadPlaces(params.map);
    },
    
    listenForMap: function () {
      $(document).on('map.initialized', this.mapInitialized.bind(this));
    },
    
    goToPlace: function (place) {
      this.selectedPlace(place);
    },
    
    getOut: function () {
      this.selectedPlace(null);
    },
    
    placeFilter: function (place, query) {
      return place.title.toLowerCase().search(query.toLowerCase()) > -1;
    },
    
    filterPlaces: function (query) {
      this.filteredPlaces(_.filter(this.allPlaces, function (place) { return this.placeFilter(place, query); }, this));
    },
    
    createPlacesFromJSON: function (json) {
      return _.map(json, function (placeData) { return new Place(placeData, this); }, this);
    }
  };
  
  function init() {
    var placeOptions = {
      location: new google.maps.LatLng(45.039717, 38.974496),
      radius: 1000,
      types: ['bar', 'bakery', 'book_store', 'cafe', 'food', 'gym', 'hair_care']
    };
    
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