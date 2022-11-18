/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"b0315MM/newvendor/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
