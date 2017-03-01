var map,
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

btnConnect.addEventListener('click', function () {
	modalLogin.style.display =  "none";
	Login.style.display = "none";
})



// Init Google Maps
function init() {
	StationOverlay = new google.maps.OverlayView();

	navigator.geolocation.getCurrentPosition(function(pos) {

		sessionStorage.setItem("latitude",pos.coords.latitude);
		sessionStorage.setItem("longitude",pos.coords.longitude);

		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: parseFloat(sessionStorage.latitude), lng: parseFloat(sessionStorage.longitude)},
			zoom: 14
		});

		var myPosition = new google.maps.Marker({
			position: {lat: parseFloat(sessionStorage.latitude), lng: parseFloat(sessionStorage.longitude)},
			title:"Vous êtes ici!"
		});

		myPosition.setMap(map);

		getVelib();
	});
}

function getVelib() {
	var xhr = getXMLHttpRequest();

	xhr.open("GET",
		"https://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&lang=fr&facet=banking&facet=bonus&facet=status&facet=contract_name&geofilter.distance="+sessionStorage.latitude+"%2C+"+sessionStorage.longitude+"%2C5000",
		true);
	xhr.send(null);

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
			var data = JSON.parse(xhr.responseText);
			for(item of data.records) {
				var newStation = new google.maps.Marker({
					position: {lat:item.geometry.coordinates[1],lng:item.geometry.coordinates[0]},
					title: ""
				})

				newStation.setMap(map);
			}
		}
	};
}


var overlay;

function StationOverlay(bounds,img,map) {
	this.bounds_ = bounds;
	this.image_ = image;
	this.map_ = map;

	this.div_ = null;

	this.setMap(map);
}