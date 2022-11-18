/*global QUnit*/

sap.ui.define([
	"syncc203/delivery/controller/delivery.controller"
], function (Controller) {
	"use strict";

	QUnit.module("delivery Controller");

	QUnit.test("I should test the delivery controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
