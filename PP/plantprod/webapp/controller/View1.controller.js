sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/Title',
    'sap/ui/model/json/JSONModel',
    'sap/viz/ui5/data/FlattenedDataset',
    'sap/viz/ui5/controls/common/feeds/FeedItem',
    'sap/viz/ui5/controls/Popover',
    'sap/viz/ui5/controls/VizFrame',
    'sap/viz/ui5/format/ChartFormatter',
    'sap/viz/ui5/api/env/Format',
    "../model/formatter",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Title, JSONModel, FlattenedDataset, FeedItem, Popover, VizFrame, ChartFormatter, Format, formatter) {
        "use strict";

        return Controller.extend("sync.c203.plantprod.controller.View1", {
            myFormatter: formatter,
            onInit: function () {

            },
            
            oDataLoaded: function() {
                var iQuantP001 = this.getView().getModel().getData("/PlantProdSet('P001')").Quant;
                var iQuantP002 = this.getView().getModel().getData("/PlantProdSet('P002')").Quant;
                var iQuantP003 = this.getView().getModel().getData("/PlantProdSet('P003')").Quant;
                
                this.getView().setModel(
                    new JSONModel({
                        plant1 : [
                        {
                            pap: "적정생산량 / 총생산량",
                            pdata: iQuantP001

                        }],
                        plant2 : [
                        {
                            pap: "적정생산량 / 총생산량",
                            pdata: iQuantP002
                        }],
                        plant3 : [
                        {
                            pap: "적정생산량 / 총생산량",
                            pdata: iQuantP003
                        }]
                    }),
                    "view"
                );
            },

            BulletMicroValue: function(Quant, Prodp) {
                
                return Number( (Quant / Prodp * 100).toFixed(1) );
            },
            // QuantValue: function(Quant) {
            //     debugger;
            //     return Number( (Quant).toFixed(0) );
            // }
        });
    });
