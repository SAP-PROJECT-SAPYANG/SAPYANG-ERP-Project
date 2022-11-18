/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"syncc203/orderlist_last/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
