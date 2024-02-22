// Create myMap/
let myMap = L.map("map", {
    center: [40.7, -94.5],
    zoom: 3
});

// Add a tile layer to myMap/
L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Retrieve and add earthquake data to the map/
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
    // Function to define style for earthquake markers
    function mapStyle(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "black",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    // Function to define colors based on depth
    function getColor(depth) {
        switch (true) {
            case depth > 90:
                return "red";
            case depth > 70:
                return "orangered";
            case depth > 50:
                return "orange";
            case depth > 30:
                return "gold";
            case depth > 10:
                return "yellow";
            default:
                return "lightgreen";
        }
    }
    
    // Function to calculate marker radius based on magnitude
    function getRadius(mag) {
        if (mag === 0) {
            return 1;
        }
        return mag * 4;
    }

    // Adding GeoJSON layer for earthquakes
    let earthquakesLayer = L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: mapStyle,
        onEachFeature: function (feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place + "<br>Depth: " + feature.geometry.coordinates[2]);
        }
    })

    // Adding legend for depth colors
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend"),
            depth = [-10, 10, 30, 50, 70, 90];
        for (let i = 0; i < depth.length; i++) {
            div.innerHTML += '<i style="background:' + getColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);

    // Adding tectonic plates layer
    let tectonicplates = new L.LayerGroup();
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (platedata) {
        let tectonicPlatesLayer = L.geoJson(platedata, {
            color: "red",
            weight: 2
        });
      
        // Create overlay object for layer control
        let overlayMaps = {
            "Earthquakes": earthquakesLayer,
            "Tectonic Plates": tectonicPlatesLayer
        
        };// Add layer control to the map
        L.control.layers(null, overlayMaps).addTo(myMap);
        tectonicPlatesLayer.addTo(tectonicplates);
        earthquakesLayer.addTo(myMap);

        let baseMaps = {
            "Grayscale": grayscale,
            "Satellite": satellite,
            "Outdoors": outdoors

     }; // Add layer control to the map
     L.control.layers(null, baseMaps).addTo(myMap);
     GrayscaleLayer.addTo(grayscale);
     earthquakesLayer.addTo(myMap);    

        // Add tectonicplates LayerGroup to myMap
        tectonicplates.addTo(myMap);
    });
});