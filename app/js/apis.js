/*global _, $*/

/* Depends on LoDash, jQuery */

(function (global) {
  'use strict';
  
  function ArrayParameter(param) {
    this.param = param;
    this.delimiter = ',';
  }
  
  ArrayParameter.prototype = {
    constructor: ArrayParameter,
    
    toString: function () {
      return this.param.join(this.delimiter);
    }
  };
  
  function GooglePlaceTypes(types) {
    ArrayParameter.call(this, types);
    this.delimiter = '|';
  }
  
  GooglePlaceTypes.prototype = Object.create(ArrayParameter.prototype);
  GooglePlaceTypes.prototype.constructor = GooglePlaceTypes;
  
  function GoogleLocation(location) {
    ArrayParameter.call(this, location);
  }
  
  GoogleLocation.prototype = Object.create(ArrayParameter.prototype);
  GoogleLocation.prototype.constructor = GoogleLocation;
  
  function GoogleMapsAPI(options) {
    var defaults = {
      format: 'json'
    };
    this.BASE_URL = 'https://maps.googleapis.com/maps/api/';
    this.options = _.assign(defaults, this.buildOptions(options));
  }
  
  GoogleMapsAPI.prototype = {
    constructor: GoogleMapsAPI,
    
    buildOptions: function (options) {
      var PARAM_MAP = {
        'location': GoogleLocation,
        'types': GooglePlaceTypes
      };
      
      return _.mapValues(options, function (option, optionName) {
        if (PARAM_MAP.hasOwnProperty(optionName)) {
          return new PARAM_MAP[optionName](option);
        } else {
          return option;
        }
      });
    },
    
    buildParamString: function (paramValue, paramName) {
      return paramName + '=' + paramValue.toString();
    },
    
    buildParamsString: function (params) {
      return '?' + _.map(params, this.buildParamString, this).join('&');
    },
    
    buildQuery: function (apiMethod, params) {
      return [this.BASE_URL, apiMethod, params.format].join('/') +
        this.buildParamsString(params);
    },
    
    ajaxCall: function (url) {
      return $.getJSON(url);
    },
    
    setLocation: function (location) {
      this.options.location = new GoogleLocation(location);
    }
  };
  
  function GooglePlaces(placeOptions) {
    var options = _.assign({}, placeOptions);
    GoogleMapsAPI.call(this, options);
    this.BASE_URL += 'place';
  }
  
  GooglePlaces.prototype = Object.create(GoogleMapsAPI.prototype);
  _.assign(GooglePlaces.prototype, {
    constructor: GooglePlaces,
    
    nearbySearch: function () {
      var params = this.options;
      return this.ajaxCall(this.buildQuery('nearbysearch', params));
    },
    
    getPlaceDetails: function (place) {
      var params = _.assign({ reference: place.googleReference }, this.options);
      return this.ajaxCall(this.buildQuery('details', params));
    }
  });
  
  function StreetView() {
    var defaults = {
      size: '600x200',
      sensor: false
    };
    GoogleMapsAPI.call(this, defaults);
    this.BASE_URL += 'streetview';
  }
  
  StreetView.prototype = Object.create(GoogleMapsAPI.prototype);
  _.assign(StreetView.prototype, {
    constructor: StreetView,
    
    getImageUrlFor: function (place) {
      this.setLocation(place.location);
      return this.buildQuery('', this.options);
    }
  });
  
  global.StreetView = StreetView;
  global.GooglePlaces = GooglePlaces;
}(this));