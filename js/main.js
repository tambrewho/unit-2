// Activity 5: create Leaflet map of own data
//declare map var in global scope
var mainmap;

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    mainmap = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    // DONE: BROWSE FOR NEW TILESET
    // added new OSM base tilelayer
    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    	maxZoom: 17,
    	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }).addTo(mainmap);

    //call getData function
    getData();
};

// DONE: FIND NEW DATA
//function to retrieve the data and place it on the map
function getData(){
    //load the data
    $.getJSON("data/ActivityData.geojson", function(response){
            //create marker options
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            //create a GeoJSON layer with circle markers and add it to the map
            L.geoJson(response, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(mainmap);

        });
};

$(document).ready(createMap);
