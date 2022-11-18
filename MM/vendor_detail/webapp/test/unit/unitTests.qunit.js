/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"b020315/vendor_detail/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
