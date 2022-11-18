sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/viz/ui5/data/FlattenedDataset', 
    'sap/viz/ui5/controls/common/feeds/FeedItem', 
    'sap/m/Label',
    'sap/m/ColumnListItem', 'sap/m/library',
    "sap/m/MessageToast",
    'sap/m/Column',
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, formatter, FlattenedDataset, FeedItem, Label, ColumnListItem,
        MobileLibrary, MessageToast, Column, History, UIComponent, Filter, FilterOperator) {
        "use strict";

    return Controller = Controller.extend("inventmanage.controller.View2", {
        onInit: function () {
                
                var oData = {
                    inventmStgcd : null,
                    inventmMatcd : null
                };

                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "view");

                var oRouter = this.getRouter();
                oRouter.getRoute("View2").attachMatched(this._onRouteMatched, this);

				const oComponent = this.getOwnerComponent();

		  		this._setInitModel();


            },
			/**
             * 해당 화면에 대한 초기 모델 생성 함수
             */
			_setInitModel: function() {
                let aChartType = this._getChartType();

                this.getView()
                    .setModel(
                        new JSONModel({
                            typeList: aChartType,
                            selectedType: ""
                        }),
                        "DynamicType"
                    );

            },
			/**
             * 차트 타입을 제공하는 함수
             * @returns {array}
             */
				_getChartType: function() {
				return [
					{ type: 'bar' },
					{ type: 'line'},
					{ type: 'stacked_column' },
					{ type: 'stacked_bar' },
					{ type: 'donut' },
				];
			},
            /**
             * 해당 페이지 url에 접근했을 때 실행될 함수.
             * 페이지에 접근시 모델에 데이터 세팅을 해준다.
             */
			 _onPatternMatched: function(oEvent) {
                const oArguments = oEvent.getParameter('arguments'),
                      oView = this.getView(),
                      oModel = oView.getModel('DynamicType');

                oModel.setProperty('/selectedType', oArguments.type);

                
                let aItem = this.byId('DynamicType_Select')
                                  .getItems()
                                  .filter((oItem) => { return oItem.getKey() === 'line'} );
                
                this.byId('DynamicType_Select')
                    .fireChange(aItem);

                    debugger;
            },

            /**
             * 차트 타입 변경 이벤트
             * 차트 타입을 변경하면 해당 변경된 차트로 나타나게 만든다.
             * @param {sap.ui.base.Event} oEvent 
             */
            onTypeChange: function(oEvent) {
                const oControl = oEvent.getSource(),
                      sKey = oControl.getSelectedKey(),
                      oChart = this.getControl({
                        alias: 'DynamicTypeChart',
                        controlid: 'staticChart'
                      });

                oChart.setVizType(sKey);
            },
			

            _onRouteMatched: function (oEvent) {
                // console.log(oEvent.getParameter("arguments"))
                var oArg = oEvent.getParameter("arguments");
                var sStgcd = oArg.Stgcd;
                var sMatcd = oArg.Matcd;
                var oView = this.getView();
               
                // this.getView().byId("displayParam").setText(sStgcd);
                var oModel = this.getView().getModel();
                var sPath = "/InventCSet"
                var aFilter = [];
                aFilter.push(new sap.ui.model.Filter({ path: "Stgcd", operator: sap.ui.model.FilterOperator.EQ, value1: sStgcd }));
                aFilter.push(new sap.ui.model.Filter({ path: "Matcd", operator: sap.ui.model.FilterOperator.EQ, value1: sMatcd }));
                oModel.read(sPath, {filters : aFilter,
                    success: function(oData){
                        // console.log(oData);
                        debugger;
                        var oDataModel = new JSONModel(oData);
                        console.log(oDataModel);
                        oView.setModel(oDataModel, "chart");
                }});

                console.log(this.getView().getModel("chart"))
                debugger;
            },

            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);

            },
            onNavBack: function () {
                var oHistory, sPreviousHash;
    
                oHistory = sap.ui.core.routing.History.getInstance();
                sPreviousHash = oHistory.getPreviousHash();     // 내가 첫화면인지 체크하려고
    
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);          
                } else {
                    this.getRouter().navTo("RouteView1", {}, true /*no history*/);
                }
            },
        });
    });
