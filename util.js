// Load a text resource from a file over the network
var loadTextResource = function(url, cb){ //cb - callback function
	var request = new XMLHttpRequest();
	request.open('GET', url + "?please-dont-cache=" + Math.random(), true);
	request.onload = function() {
		if(request.status < 200 || request.status > 299){
			cb('Error: HTTP status: ' + request.status + ' on resource ' + url);
		}else {
			//alert('responseText: ' + request.responseText);
			cb(false, request.responseText);
		}
	};
	request.send();
};

var loadImage = function(url, cb){
	var image = new Image();
	image.onload = function(){
		cb(null, image);
	};
	image.src = url;
};

var loadJSONResource = function (url, callback) {
	loadTextResource(url, function (err, result) {
		if (err) {
			callback(err);
		} else {
			try {
				callback(null, JSON.parse(result));
			} catch (e) {
				callback(e);
			}
		}
	});
};