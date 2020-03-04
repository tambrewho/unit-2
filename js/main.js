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

    // added new OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
           attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(mainmap);

    //call getData function
    getData(mainmap);
};

function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        attributes.push(attribute);
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Step 1: Create new sequence controls
function createSequenceControls(attributes){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');

            //add skip buttons
            $(container).append('<button class="step" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="step" id="forward" title="Forward">Forward</button>');

            // disables any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    mainmap.addControl(new SequenceControl());

    // add listeners after adding control

    //replace button content with images
    $('#reverse').html('<img src="img/left.png">');
    $('#forward').html('<img src="img/right.png">');

    //set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });

    //Step 5: click listener for buttons
    $('.step').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);

        //Step 9: pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();

        //Step 9: pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
};


//Step 2: Import GeoJSON data
function getData(mainmap){
  //load the data
  $.getJSON("data/ActivityData.geojson", function(response){
       //calculate minimum data value
       minValue = calcMinValue(response);

       //create an attributes array
       var attributes = processData(response);
       //call function to create proportional symbols
       createPropSymbols(response, attributes);
       createSequenceControls(attributes);
  });
};

//function to convert markers to circle markers
function pointToLayer(feature, coordinates, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(coordinates, options);

    //build popup content string
    var popupContent = createPopupContent(feature.properties, attribute);

    //bind the popup to the circle marker with an offset
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius)
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){

    mainmap.eachLayer(function(layer){
      if (layer.feature && layer.feature.properties[attribute]){
          //access feature properties
          var props = layer.feature.properties;

          //update each feature's radius based on new attribute values
          var radius = calcPropRadius(props[attribute]);
          layer.setRadius(radius);

          //build popup content string
          var popupContent = createPopupContent(props, attribute);

          //update live popup content
          popup = layer.getPopup();
          popup.setContent(popupContent).update();
      };
    });
};

// function for creating attribute-based popup content
function createPopupContent(properties, attribute) {
  //build popup content string
  var popupContent = "<p><b>City:</b> " + properties.CountryName + "</p>"
                              + "<p><b>Year:</b> " + attribute + "</p>";
  //add formatted attribute to popup content string
  popupContent += "<p><b>Rural population growth (annual %):</b> " + properties[attribute].toFixed(2) + "</p>";

  return popupContent;

}

//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, attributes){
  //create a Leaflet GeoJSON layer and add it to the map
  L.geoJson(data, {
      pointToLayer: function(feature, coordinates){
        return pointToLayer(feature, coordinates, attributes);
      }
  }).addTo(mainmap);
};

function calcMinValue(data){
     //create empty array to store all data values
     var allValues = [];

     //loop through each city
     for(var city of data.features){
          //loop through each year
          for(var year = 2008; year <= 2018; year+=1){
                //get population for current year
               var value = city.properties[String(year)];
               //add value to array
               allValues.push(value);
           }
     }
     //get minimum value of our array
     var minValue = Math.min(...allValues)

     return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
     //constant factor adjusts symbol sizes evenly
     var minRadius = 20;
     //Flannery Appearance Compensation formula
     var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

     return radius;
};

$(document).ready(createMap);
