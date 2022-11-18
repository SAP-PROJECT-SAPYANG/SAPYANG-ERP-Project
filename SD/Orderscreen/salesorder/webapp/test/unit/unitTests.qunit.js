/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"syncc203/salesorder/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
