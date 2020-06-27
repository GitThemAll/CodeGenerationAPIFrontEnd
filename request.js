

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
		var xhr = new XMLHttpRequest();
		xhr.withCredentials = true;
		xhr.addEventListener("readystatechange", function() {
		if(this.readyState === 4) {
			console.log(this.responseText);
			resolve(this.responseText);
		}
		});
		xhr.open(method, url);
		xhr.setRequestHeader("Content-Type", "application/json");
		if(authHeader){
			xhr.setRequestHeader("Authorization", "Bearer "+authHeader)
		}
		if(JSONObjectData!=null){
		var data = JSON.stringify(JSONObjectData);
		xhr.send(data);
		}
		else{
			xhr.send();
		}
		});
	}

	window.GetJSON = function (url, authHeader) {
		return new Promise(function (resolve, reject) {
			doHttprequest('GET', 'json', url, null ,authHeader)
				.then(function (requestResult) {
					resolve(requestResult);
				})
				.catch(function (errorResult) {
					reject(errorResult);
				});
		});
	}

	window.DeleteJSON = function (url, authHeader=null) {
		return new Promise(function (resolve, reject) {
			doHttprequest('DELETE', 'json', url, null, authHeader)
				.then(function (requestResult) {
					resolve(requestResult);
				})
				.catch(function (errorResult) {
					reject(errorResult);
				});
		});
	}

	window.PutJSON = function (url, JSONObjectData, authHeader=null) {
		return new Promise(function (resolve, reject) {
			doHttprequest('PUT', 'json', url, JSONObjectData, authHeader)
				.then(function (requestResult) {
					resolve(requestResult);
				})
				.catch(function (errorResult) {
					reject(errorResult);
				});
		});
	}
