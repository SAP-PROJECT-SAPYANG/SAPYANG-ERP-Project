/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"syncc203/plantfault/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
