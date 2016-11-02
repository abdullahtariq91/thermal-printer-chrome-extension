chrome.runtime.onMessageExternal.addListener(function (stuff) {
	if(stuff){
		function pad(n, width, z) {
			z = z || '0';
			n = n + '';
			return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		}
		var port = 0;
	    var endpoint = 0x01;

	    // needs to be set in optional permissions for each VID/PID pair
	    var device = {vendorId: 7072, productId: 8709};

		function onDeviceFound(devices) {
			this.devices=devices;
			if (devices) {
				if (devices.length > 0) {
					console.log("Device(s) found: " + devices.length);
					console.log(devices);
				} else {
					console.log("Device could not be found");
				}
			} else {
				console.log("Permission denied.");
			}
		}
	    // for debugging
	    chrome.usb.findDevices({productId: 8709, vendorId: 7072}, onDeviceFound);
	    chrome.usb.getDevices({filters: []}, onDeviceFound);

	    String.prototype.toBytes = function() { 
			var arr = [];
			for (var i=0; i < this.length; i++) { 
				arr.push(this[i].charCodeAt(0));
			} 
			return arr; 
	    }

	    // setting variables for printing, array for data, and calculations
	    var alignLeft = [0x01B, 0x061, 0];
	    var alignCenter = [0x01B, 0x061, 1];
	    var alignRight = [0x01B, 0x061, 2];
	    var endPrint = [0x01B, 0x064, 2];
	    // enter new line
	    var lineFeed = [0x00A];
	    var buzz = [07];
	    var drawLineMiddle = "________________________________________________".toBytes();
	    var drawLineSmall = "________________________________".toBytes();
	    var horizontalTab = [0x009];
	    var cutpaperFull = [0x01D, 0x056, 1];
	    var cutpaperPartial = [0x01D, 0x056, 0];

	    function createAnything() {
	    	var anything = alignCenter;
	    	anything = anything.concat("Awesome Chrome Extension".toBytes());
	    	anything = anything.concat(lineFeed);
	    	anything = anything.concat(drawLineMiddle);
	    	anything = anything.concat(stuff.stuffToPrint.toBytes());
	    	anything = anything.concat(lineFeed);
	    	return anything;
	    }

		function createReceipt(devices) {
			var data = [];
			data = data.concat(createAnything());
			data = data.concat(endPrint);
			data = data.concat(cutpaperPartial);
			var buffer = new Uint8Array(data).buffer;
			var transferinfo = {direction: "out", endpoint: endpoint, data: buffer };
			chrome.usb.bulkTransfer({handle: devices[0].handle, vendorId: devices[0].vendorId, productId: devices[0].productId}, transferinfo, function(response) {
				if (response.resultCode == 0) {
					chrome.usb.closeDevice({handle: devices[0].handle, vendorId: devices[0].vendorId, productId: devices[0].productId}, chrome.notifications.create("4", {type: "basic", iconUrl: "icon.png", title: "Success!", message: "Printing receipt..."}, function() {console.log("Success!")}));
				} else {
					console.log("Error ", response);
				} 
			});
		}

		var connect = function(callback) {
			chrome.permissions.getAll(function(p) {
				if (p.permissions.indexOf("usb") >= 0) {
					//construct permission object for our device
					var obj = { usbDevices: [device] };
					//now request the permissions
					chrome.permissions.request({ permissions: [obj] }, function(granted) {
						if (granted) {
							chrome.usb.findDevices(device, function(devices) {
								if (devices && devices.length > 0) {
									//use the first found device
									var foundDevice = devices[0];
									//now lets reset the device
									chrome.usb.resetDevice(foundDevice, function() {
										//perform some error checking to make sure we reset the device
										if ( ! chrome.runtime.lastError) {
											//now claim the interface using the port we specified
											chrome.usb.claimInterface(foundDevice, port, function() {
											if ( ! chrome.runtime.lastError) {
												callback(devices);
											} else {
												throw chrome.runtime.lastError.message;    
											} 
											});
										} else {
											throw chrome.runtime.lastError.message;
										}
									});
								} else {
									chrome.notifications.create("1", {type: "basic", iconUrl: "icon.png", title: "Error", message: "Device not found!"}, function() {console.warn("Device not found!")});
									console.warn("Device not found!");
								}
							});
						} else {
							chrome.notifications.create("2", {type: "basic", iconUrl: "icon.png", title: "Error", message: "USB Permission not granted."}, function() {console.warn("USB Permission not granted.")});
							console.warn("USB Permission not granted.");
						}
					});
				} else {
					chrome.notifications.create("3", {type: "basic", iconUrl: "icon.png", title: "Error", message: "No USB permissions granted."}, function() {console.warn("No USB permissions granted.")});
					console.warn("No USB permissions granted.");
				}
			});
		}
		connect(createReceipt);
	}
});