sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/Title',
    'sap/ui/model/json/JSONModel',
    'sap/viz/ui5/data/FlattenedDataset',
    'sap/viz/ui5/controls/common/feeds/FeedItem',
    'sap/viz/ui5/controls/Popover',
    'sap/viz/ui5/controls/VizFrame',
    'sap/viz/ui5/format/ChartFormatter',
    'sap/viz/ui5/api/env/Format'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Title, JSONModel, FlattenedDataset, FeedItem, Popover, VizFrame, ChartFormatter, Format) {
        "use strict";

        return Controller.extend("project1.controller.View1", {
            onInit: function () {
                this.getView()
                    .setModel(
                        new JSONModel({
                            data : [],
                            toggle: true
                        }),
                        "view"
                    )

                this._readFaultAnalysisSet(
                    "/FaultAnalysisSet",
                    [],
                    "product"
                );
            },

            /**
             * FaultAnalysisSet을 읽는 함수
             * 해당 데이터를 읽고 view 모델의 data에 데이터를 저장한다.
             * @param {array} aFilter 
             */
            _readFaultAnalysisSet: function(sEntitySetName ,aFilter, sGubun) {
                var oView = this.getView(),
                    oComponent = this.getOwnerComponent(),
                    oModel = oComponent.getModel(),
                    oViewModel = oView.getModel('view');
                    
                oView.setBusy(true);
                oModel.read(sEntitySetName, {
                    filters: aFilter || [],
                    success: function(oData) {
                        var aResult = oData.results;
                        var aDeduplicationData;
                        var aChartData;
                        debugger;
                        if(sGubun === "product"){
                            aDeduplicationData = aResult.reduce(function(acc, current) {
                                if (acc.findIndex(({ Matnm }) => Matnm === current.Matnm) === -1) {
                                  acc.push(current);
                                }
                                return acc;
                              }, []);

                            aChartData = aDeduplicationData.map(function(item) {
                                return {
                                    x: item.Matnm,
                                    y: item.Fault
                                };
                            });
                        }
                        if(sGubun === "plant"){
                            aDeduplicationData = aResult.reduce(function(acc, current) {
                                if (acc.findIndex(({ Plant }) => Plant === current.Plant) === -1) {
                                  acc.push(current);
                                }
                                return acc;
                              }, []);

                            aChartData = aDeduplicationData.map(function(item) {
                                return {
                                    x: item.Plant,
                                    y: item.Fault
                                };
                            });
                        }



                        oViewModel.setProperty('/data', aChartData);
                        oView.setBusy(false);
                    },
                    error: function() {
                        oView.setBusy(false);
                    }
                });
            },

            roundFormat: function(Dtcnt, Fault) {
                return Number( (Dtcnt / Fault * 100).toFixed(1) );
            },

            onToggle: function(oEvent, sGubun) {

                var sValue;
                var oView = this.getView(),
                    oViewModel = oView.getModel('view')

                if(sGubun === "product"){
                    sValue = true;
                    if(oViewModel.getProperty('/toggle') !== sValue){
                        
                        this._readFaultAnalysisSet(
                            "/FaultAnalysisSet",
                            [],
                            sGubun
                        );
                    }
                }else{
                    sValue = false;
                    if(oViewModel.getProperty('/toggle') !== sValue){
                        
                        this._readFaultAnalysisSet(
                            "/FaultAnalysisPlantSet",
                            [],
                            sGubun
                        );
                    }
                }

                this.getView()
                    .getModel('view')
                    .setProperty(
                        '/toggle',
                        sValue
                    )
            }

        });
    });