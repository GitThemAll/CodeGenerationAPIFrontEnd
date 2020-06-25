
if (typeof (PostJSON) != 'function' || typeof (doHttprequest) != 'function' || typeof (GetJSON) != 'function') {

	//need to check if function already exist in the project 
	window.PostJSON = function (url, JSONObjectData, authHeader=null) {
		return new Promise(function (resolve, reject) {
			doHttprequest('POST', 'json', url, JSONObjectData, authHeader)
				.then(function (requestResult) {
					resolve(requestResult);
				})
				.catch(function (errorResult) {
					reject(errorResult);
				});
		});
	}

	window.doHttprequest = function (method, responseType, url, JSONObjectData, authHeader) {
		return new Promise (function (resolve, reject) {
		var request = new XMLHttpRequest();
		var data = JSON.stringify(JSONObjectData);
		var xhr = new XMLHttpRequest();
		xhr.withCredentials = true;
		xhr.addEventListener("readystatechange", function() {
		if(this.readyState === 4) {
			console.log(this.responseText);
			resolve(this.responseText);
		}
		});
		xhr.open("POST", url);
		xhr.setRequestHeader("Content-Type", "application/json");
		if(authHeader){
			xhr.setRequestHeader("Authorization", "Bearer "+authHeader)
		}
		xhr.send(data);
		});
	}

	window.GetJSON = function (url) {
		return new Promise(function (resolve, reject) {
			doHttprequest('GET', 'json', url)
				.then(function (requestResult) {
					resolve(requestResult);
				})
				.catch(function (errorResult) {
					reject(errorResult);
				});
		});
	}
}
