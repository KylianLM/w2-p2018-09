var map,
markersArray = [],
dataAPI = 'https://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&';

function getXMLHttpRequest() {
	var xhr = null;	
	if (window.XMLHttpRequest || window.ActiveXObject) {
		if (window.ActiveXObject) {
			try {
				xhr = new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
		} else {
			xhr = new XMLHttpRequest(); 
		}
	} else {
		alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
		return null;
	}
	
	return xhr;
}

// Modal Js
var Login = document.getElementById('login'),
modalLogin = document.getElementById('modalLogin'),
modalRegister = document.getElementById('modalRegister'),
btnRegister = document.getElementById('openModalRegister'),
btnLogin = document.getElementById('openModalLogin'),
btnConnect = modalLogin.querySelector('input[type="submit"]'),
btnSignIn = modalRegister.querySelector('input[type="submit"]'),
closeLogin = modalLogin.querySelector('.close'),
closeRegister = modalRegister.querySelector('.close');

btnLogin.addEventListener('click', function () {
	modalLogin.style.display = "block";
});
btnRegister.addEventListener('click', function () {
	modalRegister.style.display = "block";
});

closeLogin.addEventListener('click', function () {
	modalLogin.style.display =  "none";
})
closeRegister.addEventListener('click', function () {
	modalRegister.style.display =  "none";
})

btnConnect.addEventListener('click', function (e) {
	e.preventDefault();
	modalLogin.style.display =  "none";
	Login.style.display = "none";
})

btnSignIn.addEventListener('click', function (e) {
	e.preventDefault();
	modalRegister.style.display =  "none";
	Login.style.display = "none";
})

document.getElementById('closeProx').addEventListener('click', function () {
	document.getElementById('modalProx').style.display = "none";
});
document.getElementById('closeProx2').addEventListener('click', function () {
	document.getElementById('modalProx').style.display = "none";
})

//MAPS Navigation

var btnMyPos = document.getElementById('myPosition'),
btnNewPos = document.getElementById('newPosition'),
modalPos = document.getElementById('modalPosition'),
closePos = modalPos.querySelector('.close');

btnMyPos.addEventListener('click', function () {
	getMyPosition();
});

btnNewPos.addEventListener('click', function () {
	modalPos.style.display = "block";
})

closePos.addEventListener('click', function () {
	modalPos.style.display = "none";
})
// Init Google Maps
function init() {
	StationOverlay.prototype = new google.maps.OverlayView();


	StationOverlay.prototype.onAdd = function () {
		var div = document.createElement('div');
		div.style.position = 'absolute';

		// Create the img element and attach it to the div.
		var img = document.createElement('img');
		img.src = this.image_;
		img.style.width = '100%';
		img.style.height = '100%';
		img.style.position = 'absolute';
		div.appendChild(img);

		this.div_ = div;

		var panes = this.getPanes();
		panes.overlayLayer.appendChild(div);
	}

	StationOverlay.prototype.onRemove = function() {
		this.div_.parentNode.removeChild(this.div_);
		this.div_ = null;
	};

	StationOverlay.prototype.draw = function() {
		var overlayProjection = this.getProjection();

		var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
		var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

		var div = this.div_;
		div.style.left = sw.x + 'px';
		div.style.top = ne.y + 'px';
		div.style.width = (ne.x - sw.x) + 'px';
		div.style.height = (sw.y - ne.y) + 'px';
		
		this.getPanes().overlayMouseTarget.appendChild(div);
	};

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 48.866667, lng: 2.333333},
		zoom: 15,
		disableDefaultUI: true
	});

	var input = /** @type {!HTMLInputElement} */(
		document.getElementById('inputPos'));;

	var autocomplete = new google.maps.places.Autocomplete(input),
	place;
	autocomplete.addListener('place_changed', function() {
		place = autocomplete.getPlace();
	});

	document.getElementById('validatePos').addEventListener('click', function (e) {
		e.preventDefault();
		if (!place.geometry) {
			window.alert("Autocomplete's returned place contains no geometry");
			return;
		} else {
			sessionStorage.setItem("latitude",place.geometry.location.lat());
			sessionStorage.setItem("longitude",place.geometry.location.lng());
			changePosition(place.geometry.location);
			modalPos.style.display = "none";
		}
	})
}

function clearOverlays() {
	for (var i = 0; i < markersArray.length; i++ ) {
		markersArray[i].setMap(null);
	}
	markersArray.length = 0;
}

function getMyPosition() {
	navigator.geolocation.getCurrentPosition(function (pos) {
		sessionStorage.setItem("latitude",pos.coords.latitude);
		sessionStorage.setItem("longitude",pos.coords.longitude);

		var crd = {lat:parseFloat(sessionStorage.latitude),lng: parseFloat(sessionStorage.longitude)};
		changePosition(crd,crd,true)
	})
}

function changePosition(LatLng, myPosition = null,clear = true) {
	if (clear) {
		clearOverlays();
	}
	map.panTo(LatLng);

	var myPosition = new google.maps.Marker({
		position: myPosition,
		title:"Vous êtes ici!"
	});

	myPosition.setMap(map);
	markersArray.push(myPosition);

	getVelib();

	var bounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(LatLng),
		new google.maps.LatLng(LatLng.lat + 0.008652, LatLng.lng + 0.001524));
	var srcImage = 'https://developers.google.com/maps/documentation/' +
	'javascript/examples/full/images/talkeetna.png';

	overlay = new StationOverlay(bounds,srcImage,map);
	//google.maps.event.addDomListener(overlay, 'click', function(){alert('hi')});
}

function getVelib() {
	var xhr = getXMLHttpRequest();

	xhr.open("GET",
		"https://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&lang=fr&facet=banking&facet=bonus&facet=status&facet=contract_name&geofilter.distance="+sessionStorage.latitude+"%2C+"+sessionStorage.longitude+"%2C10000",
		true);
	xhr.send(null);

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
			var data = JSON.parse(xhr.responseText),
			srcImages =['/assets/img/bike.png','/assets/img/nobike.png'];
			for(item of data.records) {
				var newStation = new google.maps.Marker({
					position: {lat:item.geometry.coordinates[1],lng:item.geometry.coordinates[0]},
					title: ""
				})

				var bounds = new google.maps.LatLngBounds(
					new google.maps.LatLng(item.geometry.coordinates[1],item.geometry.coordinates[0]),
					new google.maps.LatLng(item.geometry.coordinates[1] + 0.000952, item.geometry.coordinates[0] + 0.001524));
				var srcImage = srcImages[Math.floor(Math.random()*srcImages.length)];

				overlay = new StationOverlay(bounds,srcImage,map);
				markersArray.push(newStation);
			}

			document.getElementById('modalProx').style.display = "block";
		}
	};
}
var overlay;

/** @constructor */
function StationOverlay(bounds,image,map) {
	this.bounds_ = bounds;
	this.image_ = image;
	this.map_ = map;

	this.div_ = null;

	this.setMap(map);
}



