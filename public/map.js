//on the first page init the general map and call the zoom, and then use the lat lon to lay the map of registered
var map;
const city = $("input[name='_city']");
const latlon = $("input[name='_latlon']");

if ($("#start").length) {
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
    try {
        let coor = document.cookie.split(",");
        initMap(coor, 12);
    } catch (err) {
        console.log(err);
        initMap([59, 0], 2);
    }
}

function getLatLon() {
    return new Promise(function(resolve, reject) {
        $.get(
            "https://ipinfo.io",
            function(response) {
                city.val(response.city);
                let coor = response.loc.split(",");
                latlon.val(coor);
                document.cookie = coor; //setting http cookie
                resolve(coor);
            },
            "jsonp"
        );
    });
}

function initMap(coor, z) {
    map = L.map("map", {
        zoomControl: false,
        attributionControl: false
    }).setView(coor, z);

    var Stamen_Toner = L.tileLayer(
        "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}",
        {
            attribution:
                'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> — Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
}
