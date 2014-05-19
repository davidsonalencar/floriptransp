
/**
 * Performs the whole process of communication with the server
 */
var Find = function(){
    
    /**
     * URL base for used within ajax
     * @type String
     */
    var urlBase = 'https://api.appglu.com/v1/queries/';
    
    /**
     * Initialize ajax with default settings
     */
    $.ajaxSetup({
        type: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Basic  V0tENE43WU1BMXVpTThWOkR0ZFR0ek1MUWxBMGhrMkMxWWk1cEx5VklsQVE2OA==',
            'X-AppGlu-Environment': 'staging'
        }
    });
    
    /**
     * Handle ajax error 
     * @private
     * @param {jqXHR} jqXHR
     * @param {String} textStatus
     * @param {String} errorThrown
     */
    function _makeError (jqXHR, textStatus, errorThrown){
        navigator.notification.alert('Comunication failure to the server!');
    }
    
    /**
     * Used to call the ajax based actions names
     * @private
     * @param {String} actionName
     * @param {Object} params
     * @param {Function} callback
     */
    function _find(actionName, params, callback) {
        
        // Check params
        if (!actionName) {
            throw 'actionName param is empty in _find method the Find object';
        }
        if (actionName instanceof String) {
            throw 'actionName param do not have a string value in _find method the Find object';
        }
        if (params && !(params instanceof Object)) {
            throw 'actionName param do not have a object value in _find method the Find object';
        }
        
        // Call ajax
        $.ajax({
            url: urlBase + actionName + '/run',
            data: JSON.stringify({
                params: params || {}
            }),
            success: function(data, textStatus, jqXHR) {
                if (callback && callback instanceof Function) {
                    callback(data, textStatus, jqXHR);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                _makeError(jqXHR, textStatus, errorThrown);
            }
        });
        
    }
    
    return {
        /**
         * Find routes by stop name
         * @public
         * @param {String} stopName
         * @param {Function} callback
         */
        routersByStopName: function(stopName, callback) {
            // Fix param
            stopName = stopName || '';

            // Call ajax
            _find( 'findRoutesByStopName', {
                stopName: '%'+stopName+'%'
            }, callback );
        },
        /**
         * Find stops by route id
         * @public
         * @param {Integer} routeId
         * @param {Function} callback
         */
        stopsByRouteId: function(routeId, callback) {
            // Fix param
            routeId = routeId || 0;

            // Call ajax
            _find( 'findStopsByRouteId', {
                routeId: routeId
            }, callback );
        },
        /**
         * Find departures by route id
         * @public
         * @param {Integer} routeId
         * @param {Function} callback
         */
        departuresByRouteId:  function(routeId, callback) {
            // Fix param
            routeId = routeId || 0;

            // Call ajax
            _find( 'findDeparturesByRouteId', {
                routeId: routeId
            }, callback );
        }
    };
};

/**
 * Performs all proccess of the routes section
 */
var RoutesSection = function() {
    
    /**
     * Initialize
     */
    var _section = $('div#routes.section');
    
    if (!_section) {
        throw 'Routers Section not found';
    }
    
    /**
     * @private
     * @param {Event} event
     */
    function _submit(event) {
        
        // Prevent default submit form
        event.preventDefault();
        
        // Get form
        var form = $(event.target);
        
        // Get search field
        var searchField = form.find('input[type=search]');
        
        if (searchField.length === 0) {
            throw 'Not found the search field on the routers form.';
        }
        
        // Trigger event when submit form 
        $(this).trigger({
            type: "search",
            value: $(searchField[0]).val()
        });
        
    }
    
    /**
     * Make list of the routes
     * @private
     * @param {String} data
     */
    function _makeList( data ) {
        
        // Get ul element 
        var list = _section.find('ul.list');
        // Erase content
        list.empty();
        // Each all routes
        $.each( data.rows, function(index, value){
            
            // Add A element within the LI element, when you click it, trigger 
            // the select event containing id, shortName and longName router
            list.append( 
                
                $('<li/>').append( 
                    $('<a/>', {
                        href: 'javascript:;'
                    }).html( 
                        value.shortName + ' - ' + value.longName 
                    ).on('click', function(){
                        
                        $(this).trigger({
                            type: "select",
                            value: value.id,
                            shortName: value.shortName,
                            longName: value.longName
                        });
                        
                    }.bind(this))
                ) 
            );
        }.bind(this) );
        
    }
    
    return {
        
        section: _section,
        
        /**
         * Build search form and maps button 
         * @public
         */
        build: function () {
        
            // Search form
            var form = _section.find('form');

            if (form.length === 0) {
                throw 'Not found the routers form on the routers section.';
            }

            form.on('submit', _submit.bind(this));

            // Maps button
            var buttonMaps = _section.find('input#button-maps');
            
            buttonMaps.on('click', function(){
               
                $(this).trigger({
                    type: "click-button-maps"
                });
                
            }.bind(this));
        },
        
        /**
         * Find routes and make list
         * @public
         * @param {String} value
         * @param {Function} handleFindRoutes
         * @param {Function} callback
         */
        find: function ( value, handleFindRoutes, callback ) {
        
            if (handleFindRoutes && handleFindRoutes instanceof Function) {
                handleFindRoutes( value, function(data){
                    
                    _makeList.bind(this)(data);
                    
                    if (callback && callback instanceof Function) {
                        callback();
                    }
                    
                }.bind(this));
            }

        },
        
        /**
         * Show routes section
         * @public
         */
        show: function() {
          
            _section.show();
            
        },
        
        /**
         * Hide routes section
         * @public
         */
        hide: function() {
            
            _section.hide();
            
        }
        
    };
    
};

/**
 * Performs all proccess of the details section
 */
var DetailsSection = function() {
    
    /**
     * Initialize
     */
    var _section = $('div#details.section');
    
    if (!_section) {
        throw 'Details Section not found';
    }
    
    _section.hide();
    
    /**
     * Make departures list 
     * @private
     * @param {Object} data
     */
    function _makeDeparturesList( data ) {
        
        var list = _section.find('ul.list');
        
        function makeItem(subList, calendar, index) {
            
            // Add group
            if (!subList || calendar !== data.rows[index].calendar) {
                subList = $('<ul/>');
                list.append( 
                    $('<li/>').html( 
                        $('<span/>').html(data.rows[index].calendar)
                    ).append(
                        subList
                    )
                );
            }
            
            // Add item
            subList.append(
                $('<li/>').html( data.rows[index].time )
            );
            
            // Call next item
            if (data.rows[index + 1]) {
                makeItem(subList, data.rows[index].calendar, index + 1);
            }
            
        }
        
        // Starts recursion for make items
        makeItem(null, '', 0);
        
    }
    
    /**
     * Make stops list 
     * @private
     * @param {type} data
     */
    function _makeStopsList( data ) {
        
        // Get ul element 
        var list = _section.find('ul.list');
        // Erase content
        list.empty();
        // Each all routes
        var subList = $('<ul/>');
        // Add group
        list.append(
            $('<li/>').html( 
                $('<span/>').html('Stops')
            ).append(
                subList
            )
        );
        // Add items
        $.each( data.rows, function(index, value){
            subList.append( 
                $('<li/>').html( value.sequence + '. ' + value.name )
            );
        }.bind(this) );
        
    }
    
    /**
     * Make list header 
     * @private
     * @param {String} title
     */
    function _buildHeader( title ){
        
        // Set title
        _section.find('h2 span').html(title);
        
        // Prepare back button
        _section.find('h2 button.back').on('click', function(){
            
            // Erase items when to back
            _section.find('ul.list').empty();
            
            // Trigger back event
            $(this).trigger({
                type: "back"
            });
            
        }.bind(this));
        
    }
    
    return {
        
        /**
         * Find stops/timetables and make list
         * @public
         * @param {String} value
         * @param {String} title
         * @param {Function} handleFindStops
         * @param {Function} handleFindDepartures
         * @param {Function} callback
         */
        find: function ( value, title, handleFindStops, handleFindDepartures, callback ) {
        
            // Check required params
            if (!handleFindStops || !(handleFindStops instanceof Function)) {
                return;
            }
            if (!handleFindDepartures || !(handleFindDepartures instanceof Function)) {
                return;
            }
            
            // Prepare header
            _buildHeader.bind(this)( title );
            
            // Find stops
            handleFindStops( value, function(data){
                    
                // Make stops list 
                _makeStopsList( data, title );
            
                // Find departures
                handleFindDepartures( value, function(data){
                    
                    // Make departures list
                    _makeDeparturesList( data );
                    
                    // Callback
                    if (callback && callback instanceof Function) {
                        callback();
                    }
                    
                }.bind(this));
                
            }.bind(this));

        },
        
        /**
         * Show details section
         * @public
         */
        show: function() {
          
            _section.show();
            
        },
        
        /**
         * Show details section
         * @public
         */
        hide: function() {
            
            _section.hide();
            
        }
        
    };
    
};

/**
 * Performs all proccess of the maps section
 */
var MapsSection = function(){
  
    /**
     * Initialize
     */
    if (!google && !google.maps) {
        throw 'Api Google Maps not load.';
    }
    
    // Get section
    var _section = $('div#maps.section');
    
    if (!_section) {
        throw 'Details Section not found';
    }
    
    _section.hide();
    
    // Get maps
    var _canvas = _section.find('#canvas');
    
    $(_canvas).height( $(window).height()-69 );
    
    var _map, 
        _marker,
        _geocoder = new google.maps.Geocoder();

    /**
     * Initialize api google maps
     * @private
     */
    function _buildMaps() {
        
        var result = new google.maps.Map(_canvas[0], {
            zoom: 16
        });    

        result.addListener('click', function(event){

            _getStreet.bind(this)(event.latLng);

        }.bind(this));
        
        return result;

    }
    
    /**
     * Make maps header 
     * @private
     */
    function _buildHeader() {
        
        _section.find('h2 button.back').on('click', function(){

            $(this).trigger({
                type: "back"
            });

        }.bind(this));
        
    }
    
    /**
     * When no location set default latLng (center, Florianopolis)
     * @private
     */
    function _noLocation() {
        
        // Get position default
        var position = new google.maps.LatLng(-27.5951822,-48.5455795);
        
        // Set position on maps
        _map.setCenter(position);
        
    }
    
    /**
     * Get street name when clicking on maps
     * @private
     * @param {google.maps.LatLng} latLng
     */
    function _getStreet(latLng) {
        
        _geocoder.geocode( {
            latLng: latLng
        }, function(results, status) {
            
            // Google maps ok
            if(status === google.maps.GeocoderStatus.OK) {
                if(results[0]) {

                    // Marker maps
                    if (!_marker) {
                        _marker = new google.maps.Marker({ 
                            map: _map
                        });
                    }
                    _marker.setPosition(results[0].geometry.location); //on change sa position

                    // Get street name
                    var street = results[0].address_components[1].long_name;

                    // Confirm if you want to select the street
                    navigator.notification.confirm('Want to select the "'+street+'".', function(buttonIndex){
                        
                        // Click button ok
                        if (buttonIndex === 1) {
                            $(this).trigger({
                                type: "select",
                                value: street
                            });
                        }
                        
                    }.bind(this), 'Confirm', ['Ok','Cancel']);
                   
                }
                else {
                    navigator.notification.alert('No results');
                }
            }
            else {
                navigator.notification.alert('Google maps not work');
            }
        }.bind(this));
    }
     
    return {
        /**
         * Show details section
         * @public
         */
        show: function() {
          
            _section.show();
            
        },
        
        /**
         * Show details section
         * @public
         */
        hide: function() {
            
            _section.hide();
            
        },
        
        /**
         * Load maps and set location by geolocation
         * @private
         * @param {type} event
         */
        loadMaps: function(event) {

           _section.show();

           if (!_map) {
               _map = _buildMaps.bind(this)();
               _buildHeader.bind(this)();
           }

           if(navigator.geolocation) {
               navigator.geolocation.getCurrentPosition(function(position) {
                   var pos = new google.maps.LatLng(position.coords.latitude,
                                                    position.coords.longitude);

                   _map.setCenter(pos);
               }, function() {
                   _noLocation();
               });
           } else {
               _noLocation();
           }

       }
    };
    
};

/**
 * Make the app
 */
var App = function(){
    
    /**
     * Initialize find object
     */
    var _find = new Find();
    
    /**
     * Initialize routes section
     */
    var _routesSection = new RoutesSection();
    
    // Build search form routes
    _routesSection.build();
    
    // When searching, find for routes
    $(_routesSection).on('search', function(event){
        
        _visibleOverlay(true);
        
        _routesSection.find( event.value, _find.routersByStopName, function(){
            
            _visibleOverlay(false);
            
        });
        
    });
    
    // When clicking button maps
    $(_routesSection).on('click-button-maps', function(event){
        
        _routesSection.hide();
        _mapsSection.loadMaps();
        
    });
    
    // When selecting a route, find for stops
    $(_routesSection).on('select', function(event){
        
        _routesSection.hide();
        _detailsSection.show();
        _visibleOverlay(true);
        
        _detailsSection.find( event.value, event.shortName + ' - ' + event.longName, _find.stopsByRouteId, _find.departuresByRouteId, function(){
            _visibleOverlay(false);
        });
        
    });
    
    /**
     * Initialize maps section
     */
    var _mapsSection = new MapsSection();
    
    // When clicking in a back button
    $(_mapsSection).on('back', function(event){
        
        _mapsSection.hide();
        _routesSection.show();
        
    });
    
    // When select a street on maps
    $(_mapsSection).on('select', function(event){
        
        $(_mapsSection).trigger('back');
        
        $(_routesSection.section).find('input[type=search]').val(event.value);
        
        $(_routesSection).trigger({
            type: 'search',
            value: event.value 
        });
        
    });
    
    /**
     * Initialize stops section
     */
    var _detailsSection = new DetailsSection();
    
    // When clicking in a back button
    $(_detailsSection).on('back', function(event){
        
        _routesSection.show();
        _detailsSection.hide();
        
    });
    
    /**
     * Show or hide overlay
     * @param {Boolean} visible
     */
    function _visibleOverlay(visible) {
        
        var body = $('body');
        var overlay = $('div#overlay');

        // Check if exists
        if (overlay.length === 0) {
            overlay = $('<div/>', {
                id: 'overlay',
                width: $(window).width(),
                height: $(window).height()
            }).append(
                $('<div/>', {
                    class: 'loading'
                }).css({
                    marginLeft: $(window).width()/2-23,
                    marginTop: $(window).height()/2-23
                })
            ).hide();

            body.append(overlay);
        }
        
        if (visible) {
            overlay.show();
            body.css('overflow', 'hidden');
        } else {
            overlay.hide();
            body.css('overflow', 'auto');
        }
        
    }
    
    return {};
    
};

/**
 * Initialize app
 */
if ("cordova" in window) {

    document.addEventListener('deviceready', function(){
 
        new App();

    }, false);
    
} else {

    $(function(){

        new App();

    });

}
