function map() {

	if (typeof google === 'undefined') {
			alert('ERROR: Google maps failed to load');
		}

	/* --------------------- Model Data ---------------------- */

	let Model = {
		// options to set up our google map
		mapOptions: {
			center: {lat: 34.068561, lng: -118.448936},
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.TERRAIN,
			mapTypeControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER
			},
			panControlOptions: {
				position: google.maps.ControlPosition.LEFT_TOP
			},
			zoomControlOptions: {
				position: google.maps.ControlPosition.LEFT_CENTER
			}
		},

		// our basic location array
		locations: [
			{
				name: 'Sunset Rec',
				type: 'gym',
				coordinates: {
					lat: 34.075471,
					lng: -118.451222
				}
			},
			{
				name: 'Powell Library',
				type: 'gym',
				coordinates: {
					lat: 34.072108,
					lng: -118.442026
				}
			},
			{
				name: 'John Wooden statue',
				type: 'gym',
				coordinates: {
					lat: 34.071032,
					lng: -118.446511
				}
			}
		],

		// programmatically set the icon color which goes
		// with the right location type
		setLocationIcon: function() {
			// define letiables outside the for loop
			let i, color, location, locationType;
			let locationsLength = Model.locations.length;

			for (i = 0; i < locationsLength; i++) {
				location = Model.locations[i];
				locationType = location.type;

				// colors according to filterOptions array below
				if (locationType === 'gym')
					location.icon = 'resources/gym.png'
			}
		},

		infoWindowContent: null,

		// sets the info window content
		makeInfoWindow: function(i, markerCopy) {
			Model.infoWindowContent = Model.locations[i].name;
			// once done constructing info window content,
			// call on VM to set info window to right marker
			myViewModel.setUpInfoWindow(markerCopy);
		}
	};


	/* --------------------- ViewModel ----------------------*/

	let ViewModel = function() {
		let self = this;

		Model.setLocationIcon();
		// listen to the search box for changes
		self.query = ko.observable('');

		// put locations in VM to construct listview in DOM using KO
		self.locationsList = [];
		Model.locations.forEach(function(element) {
			self.locationsList.push(element);
		});

		// put locations length in VM for use in search and show functions
		self.locationsListLength = self.locationsList.length;

		// make an array to hold each marker
		self.markersList = [];
		console.log(self.markersList);

		// when a marker is clicked, open an info window and animate the marker
		self.makeInfoWindow = function(i, markerCopy) {
			// the click event handler for each marker
			google.maps.event.addListener(markerCopy, 'click', function() {
				// model constructs info window content for each location
				Model.makeInfoWindow(i, markerCopy);
			});
		};

		self.setUpInfoWindow = function(markerCopy) {
			let infoWindow = self.infoWindow;
			// set the right content
			infoWindow.setContent(Model.infoWindowContent);
			// open the info window when a marker is clicked
			infoWindow.open(self.map, markerCopy);

			self.setUpMarkerAnimation(markerCopy);
		};

		self.setUpMarkerAnimation = function(markerCopy) {
			// make any previously clicked marker stop bouncing
			self.markersList.forEach(function(element) {
				element.setAnimation(null);
			});
			// make the clicked marker bounce
			markerCopy.setAnimation(google.maps.Animation.BOUNCE);
			// stop bouncing the marker when you close the info window
			google.maps.event.addListener(self.infoWindow, 'closeclick', function() {
				markerCopy.setAnimation(null);
			});
		};

		// link each list item to the correct info window
		self.makeListClickable = function(index) {
			console.log(self.markersList[index()]);
			google.maps.event.trigger(self.markersList[index()], 'click');
			self.hideList();
		};

		self.hideList = function() {
			if ($(window).width() < 750) {
				$('.list-container').css('left', '-400px');
				$('.show-locations').show();
			}
		};

		self.showList = function() {
			$('.list-container').css('left', '0');
			$('.show-locations').hide();
		};

		self.search = function() {
			let searchValue = new RegExp(self.query(), 'i');
			let i, result;

			// reset everything
			self.infoWindow.close();
			// first make all markers show on screen
			self.markersList.forEach(function(element) {
				element.setAnimation(null);
				element.setMap(self.map);
			});
			// and make all list items show on screen
			$('.list-item').show();

			for (i = 0; i < self.locationsListLength; i++) {
				// test if search query matches any location names
				result = searchValue.test(self.locationsList[i].name);
				// if the search query does not match a location name,
				// hide its marker and list item
				if (result === false) {
					self.markersList[i].setMap(null);

					$('#' + i).hide();
				}
			}
		};
		// if changes in the search box, call the search function
		self.query.subscribe(self.search);

		// initialize the map
		self.initializeMap = function() {
			// create the map
			let mapCanvas = document.getElementById('map-canvas');
			self.map = new google.maps.Map(mapCanvas, Model.mapOptions);

			// declare letiables outside of the loop
			let locations = self.locationsList;
			let locationsLength = locations.length;
			let i, marker;
			// make one info window
			self.infoWindow = new google.maps.InfoWindow({
				maxWidth: 300,
			});
			// for loop makes markers with info windows
			for (i = 0; i < locationsLength; i++) {
				// make markers
				marker = new google.maps.Marker({
					position: locations[i].coordinates,
					icon: locations[i].icon
				});
				marker.setMap(self.map);
				// add each marker to an array
				self.markersList.push(marker);
				// add info windows
				self.makeInfoWindow(i, marker);
				console.log(marker);
			}
		};

		self.initializeMap();

		// prevent form from submitting when user presses enter key
		$(document).on('keypress', 'form', function(e) {
			let code = e.keyCode || e.which;

			if (code === 13) {
				e.preventDefault();

				return false;
			}
		});
	};

	// allows us to reference our instance of the ViewModel
	let myViewModel = new ViewModel();

	ko.applyBindings(myViewModel);
}