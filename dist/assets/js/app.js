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

function init() {
    navigator.geolocation.getCurrentPosition(function(pos) {
        var crd = pos.coords;
            map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: crd.latitude, lng: crd.longitude},
            zoom: 15
        });
    });
    var xhr = getXMLHttpRequest();

    xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
			console.log(JSON.parse(xhr.responseText));
		}
	};

    xhr.open("GET",
    	"https://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&lang=fr&facet=banking&facet=bonus&facet=status&facet=contract_name&geofilter.distance=48.9093300219%2C+2.35805056574%2C300",
    	true);
    xhr.send(null);
}
