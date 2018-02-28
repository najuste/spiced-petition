//on the first page init the general map and call the zoom
var map;
var lat, lon;

function getLatLon() {
    // do something
    return new Promise(function(resolve, reject) {
        $.get(
            "https://ipinfo.io",
            function(response) {
                console.log("Made a ping!");
                if (!response.loc) {
                    var location = response.city;
                    // FIXME: no fly in, have to extract the location
                    reject("no coordinates provided, got just city");
                } else {
                    location = response.loc;
                    location = location.split(",");
                    console.log("In a function", location);
                    resolve(location);
                }
            },
            "jsonp"
        );
    });
}

if ($("#start-page").length) {
    initMap([59, 0], 2);

    getLatLon()
        .then(results => {
            var [lat, lon] = results;
            setTimeout(function() {
                map.flyTo(new L.LatLng(lat, lon), 12);
            }, 2000);
        })
        .catch(function(error) {
            console.log(error.message);
        });
} else {
    getLatLon()
        .then(results => {
            var [lat, lon] = results;
            initMap([lat, lon], 12);
        })
        .catch(function(error) {
            console.log(error.message);
        });
    console.log("If not start page, do we know the lat and lon", lat, lon);
}

function initMap(coor, z) {
    map = L.map("map", { zoomControl: false }).setView(coor, z);

    // get the stamen toner-lite tiles
    var Stamen_Toner = L.tileLayer(
        "http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}",
        {
            attribution:
                'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> — Map data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: "abcd",
            minZoom: 0,
            maxZoom: 20,
            ext: "png"
        }
    );
    Stamen_Toner.addTo(map);
    map.scrollWheelZoom.disable();

    setMapRect();
    window.onresize = function() {
        setMapRect();
    };
}

function setMapRect() {
    $("#map")
        .height($(window).height() - 100)
        .width($(window).width());
    map.invalidateSize();
    console.log("window size:", $(window).height(), $(window).width());
}

// TODO:
/////Better would be either to store lat lon in a cookie or get the tiles and store them
