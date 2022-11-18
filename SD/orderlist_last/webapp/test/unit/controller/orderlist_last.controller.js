/*global QUnit*/

sap.ui.define([
	"syncc203/orderlist_last/controller/orderlist_last.controller"
], function (Controller) {
	"use strict";

	QUnit.module("orderlist_last Controller");

	QUnit.test("I should test the orderlist_last controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
