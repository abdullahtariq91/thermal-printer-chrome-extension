
# Thermal Printer Extension for ESC/POS Commands

## Usage
1. Find out the VID/PID (vendorID & productID) of the thermal printer and make changes accordingly in `main.js` and `manifest.json`.
2. In `manifest.json`, make changes to `externally_connectable` (currently set to localhost:3000).
3. Open chrome://extensions in Chrome.
4. Enable "Developer mode" and click "Load unpacked extension..."
5. Select the 'extension' folder

### Testing

Create a simple AngularJS app:
```
angular.module('receiptapp', []).controller('ReceiptController', function ($scope) {
  var stuff = {
    stuffToPrint: "Printing this!"
  };
	$scope.printStuff = function () {
      chrome.runtime.sendMessage("chklklmchflbhdhlheeddigflianadik", stuff);
	};
});
```

Create a simple HTML file:
```html
<!DOCTYPE html>
<html ng-app="receiptapp">
  <head>
    <script data-require="angular.js.1.3@*" data-semver="1.5.2" src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.2/angular.js"></script>
    <script src="printreceipt.js"></script>
  </head>
  <body>
    <div ng-controller="ReceiptController">
      <div>
        <button type="button" ng-click="printStuff()">
          Print
        </button>
      </div>
    </div>
  </body>
</html>
```

Use http-server to host:
```
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
  http://192.168.1.7:8080
Hit CTRL-C to stop the server
```

Add both links to `externally_connectable` in manifest.json (and reload).

Click "print".

## Credits
- [David Kelly](https://github.com/davidkelley/davidkelley.github.io/tree/master/_posts) for his concise and informative posts on how to communicate with a device connected via USB.
- [Site Point](https://www.sitepoint.com/create-chrome-extension-10-minutes-flat/) for teaching me how to create a Chrome extension in 10 minutes (literally).

