sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/library",
    "sap/m/Button",
    "sap/m/Text",
    'sap/ui/core/Fragment',
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, MessageToast, 
        Dialog, mobileLibrary, Button, Text, Fragment, MessageBox) {
        "use strict";

        return Controller.extend("sync.c203.salesorder.controller.View2", {
             onInit: function () {

             },

             onNavBack : function() {

                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteView1", {}, true);

            },

            // onRouter: function() {
            //     return decodeURIComponent.getRouterFor(this);
            // },

            // onNavToView2: function() {
            //     this.getRouter().naTo("View2");
            // }


        });
    });


    