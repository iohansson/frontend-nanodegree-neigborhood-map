/*global google, console, ko, $, _, Place, GooglePlaces, StreetView */
(function () {
  'use strict';
  
  function AppViewModel(placeOptions) {
    var self = this;
    
    this.allPlaces = [];
    this.filteredPlaces = ko.observableArray([]);
    this.selectedPlace = ko.observable(null);
    this.searchQuery = ko.observable();
    this.errors = ko.observableArray([]);
    
    this.searchQuery.subscribe(this.filterPlaces, this);
    this.searchQuery.extend({ rateLimit: 100 });
    
    this.placesAPI = new GooglePlaces(placeOptions);
    this.streetViewAPI = new StreetView();
    
    this.placesAPI.nearbySearch().done(function (data) {
      var places = this.createPlacesFromJSON(data.results);
      this.allPlaces = places;
      this.filteredPlaces(places);
    }.bind(this)).fail(function (jqxhr, textStatus, error) {
      this.errors.push('Unable to get places');
    }.bind(this));
  }
  
  AppViewModel.prototype = {
    constructor: AppViewModel,
    
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
      return _.map(json, function (placeData) { return new Place(placeData); });
    }
  };
  
  function init() {
    var placeOptions = {
      location: [45.039717, 38.974496],
      key: 'AIzaSyA2sDG_fSbST5gz5bT__iWjmdpGblgPNmA',
      radius: 1000,
      sensor: false,
      types: ['bar', 'bakery', 'book_store', 'cafe', 'food', 'gym', 'hair_care']
    };
    
    ko.components.register('places-list', {
      viewModel: {
        createViewModel: function (params, componentInfo) {
          function PlacesListViewModel() {
            this.places = params.places;
          }
          
          return new PlacesListViewModel();
        }
      },
      template: { element: 'places-list.html' }
    });
    
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
    
    ko.components.register('place-reviews', {
      viewModel: {
        createViewModel: function (params, componentInfo) {
          function PlaceReviewsViewModel() {
            var api = params.api,
              apiCall;
            
            this.place = params.place;
            this.errors = ko.observableArray([]);
            
            apiCall = this.place.prepareReviews(api);
            
            if (apiCall !== undefined) {
              apiCall.done(function (details) {
                this.reviews(details.result.reviews);
              }.bind(this.place)).fail(function (jqXHR, textStatus, error) {
                this.errors.push('Unable to get place reviews');
              }.bind(this));
            }
          }
          
          return new PlaceReviewsViewModel();
        }
      },
      template: { element: 'place-reviews.html' }
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
        var date = new Date(valueAccessor());
        
        $(element).text(date.toDateString());
      }
    };
    
    ko.applyBindings(new AppViewModel(placeOptions));
  }
  
  document.addEventListener('DOMContentLoaded', init);
}());