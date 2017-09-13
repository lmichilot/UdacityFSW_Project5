// Declaring global variables now to satisfy strict mode
var map;
var prev_infowindow = false;
var prev_marker = false;
var ko;
var google;
var $; // jshint ignore:line
var CLIENT_ID = "EUXIRUM3F2OTJLL3BKZH5XZ0ACZZ33P2CLN0LB4YC4QFNGF2";
var CLIENT_SECRET = "XKMVYPLAQ14RIVPDNLLYSXA53MWMCU2ON3IZ0RNCE4YN1N2F";


var Park = function (data) {
    /* Return park object */
    "use strict";
    var self = this;
    this.id = data.id;
    this.name = data.name;
    this.lat = data.lat;
    this.long = data.lng;
    this.setMarkerMap = ko.observable(true);
    this.address = "No address provided";
    this.city = "No city provided";
    this.postalcode = "No postal code provided";
    this.contentString = "";
    var fsAPI = "https://api.foursquare.com/v2/venues/search?ll=" + self.lat + "," + self.long + "&client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20170911" + "&query=" + self.name;
    
    $.ajax({
        dataType: "json",
        url: fsAPI,
        data: [],
        async: true,
        success: function (data) {
            var results = data.response.venues[0];
            self.address = results.location.formattedAddress[0] || 'No address provided';
            self.city = results.location.formattedAddress[1] || 'No city provided';
            self.postalcode = results.location.postalCode || 'No postal code provided';
        },
        error: function (xhr, status, error) {
            console.log(xhr);
            console.log(status);
            alert("Error with the Foursquare API. \n" + error);
            return;
        }
    });

    this.infowindow = new google.maps.InfoWindow();
    this.marker = new google.maps.Marker({
        position: { lat: data.lat, lng: data.lng },
        map: map,
        title: data.name,
        icon: "http://maps.google.com/mapfiles/ms/micons/red-pushpin.png",
        visible: false
    });

    self.marker.addListener('click', function () {
        self.contentString = infoText(self);
        self.infowindow.setContent(self.contentString);
        closeModal()
        prev_infowindow = self.infowindow;
        prev_marker = self.marker;
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        self.infowindow.open(map, this);
    });

    this.showinfo = function (place) {
        google.maps.event.trigger(self.marker, 'click');
    };

    ko.computed(function () {
        if (this.setMarkerMap() === true) {
            this.marker.setVisible(true);
        } else {
            this.marker.setVisible(false);
        }
        return true;
    }, this);
};

function infoText(obj) {
    /* Return modal infowindow content */
    "use strict";
    return '<div class="" id="myDescriptModal">' +
        '<div class="card">' +
        '<h4 class="card-title">' + obj.name + '</h4>' +
        '<div class="linedown"></div>' +
        '<div class="card-block wordwrapdiv">' +
        '<div class="card-text">' +
        '<span id="addr">' +
        'Address: ' + obj.address +
        '</span> <br/>' +
        '<span id="city">' +
        'Cyty: ' + obj.city +
        '</span><br/>' +
        '<span id="postal">' +
        'Postal Code: ' + obj.postalcode +
        '</span><br/>' +
        '</div>' +
        '</div>' +
        '<img id="imgAdd" class="card-img-top" src="./img/photos/' + obj.id + '.jpeg" width="100%" height="150px" alt="Card image cap">' +
        '</div>' +
        '<div class="text-center">' +
        '<img src="./img/logofoursquare.png" height="30px" width="150px" alt="Thanks Foursquare!">' +
        '</div>' +
        '</div>';
}

function initMap() {
    /* Load map full page in Peru */
    "use strict";
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -12.1167, lng: -77.05 },
        zoom: 13,
        styles: mapStyles
    });
}

function errorMap() {
    /* In Map error show error alert */
    alert("Google Maps is not available. Please check your internet connection and reload this page.");
}

function loadLocations(obj) {
    /* Manage list of locations */
    "use strict";
    myParks.forEach(function (myPark) {
        obj.locationList.push(new Park(myPark));
    });
}

function filteredLocations(obj) {
    /* Manage list of locations */
    "use strict";

    obj.filteredList = ko.computed(function () {
        var filter = obj.locationFilter().toLowerCase();
        closeModal();
        if (!filter) {
            obj.locationList().forEach(function (locationItem) {
                locationItem.setMarkerMap(true);
            });
            return obj.locationList();
        } else {
            return ko.utils.arrayFilter(obj.locationList(), function (locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.setMarkerMap(result);
                return result;
            });
        }
    }, obj);
}

function closeModal() {
    /* Close previous infowindow */
    if (prev_infowindow) {
        prev_infowindow.close();
        prev_marker.setAnimation(null);
        prev_infowindow = null;
    }
}

function AppViewModel() {
    "use strict";
    var self = this;

    /* Load Map */
    initMap();

    /* Search input */
    this.locationFilter = ko.observable("");
    
    /* Toggle control */
    this.togglesidebar = ko.observable(true);

    /* Manage list of locations */
    this.locationList = ko.observableArray([]);
    loadLocations(self);

    /* Manage list of filtered locations */
    filteredLocations(self);


}

function openSidebarButton() {
    this.togglesidebar(!this.togglesidebar());
}

function openSidebar() {
    this.togglesidebar(false);
}

function openSidebarMap() {
    if (this.togglesidebar) {
        this.togglesidebar(false);
    }
}

function initApp() {
    "use strict";
    ko.applyBindings(new AppViewModel());
}
