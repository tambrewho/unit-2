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

    // TODO: BROWSE FOR NEW TILESET
    // add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(mainmap);

    //call getData function
    getData();
};

// TODO: FIND NEW DATA
//function to retrieve the data and place it on the map
function getData(){
    //load the data
    $.getJSON("data/MegaCities.geojson", function(response){
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
