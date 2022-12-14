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

        // shortcut for sap.m.ButtonType
	    var ButtonType = mobileLibrary.ButtonType;

        // shortcut for sap.m.DialogType
	    var DialogType = mobileLibrary.DialogType;

        return Controller.extend("sync.c203.salesorder.controller.View1", {
            onInit: function () {
                var oSumData = { 
                    usum: 0,
                    psum: 0
                }

                var oView = this.getView();
                var oSumModel= new JSONModel(oSumData);
                var oCartModel = new JSONModel({
                    TotalUnit: 0,
                    TotalSum: 0,
                    cartData: []
                });
                oView.setModel(oSumModel, "umod");
                oView.setModel(oCartModel, "cart");

            },

            onSearch: function (oEvent) {
                // add filter for search
                var aFilters = [];
                var sQuery = oEvent.getSource().getValue();
                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter("Matnm", FilterOperator.Contains, sQuery);
                    aFilters.push(filter);
                }
    
                // update list binding
                var oList = this.byId("table");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilters);
            },

            onCalc: function() {
                // unit sum
                var oModel = this.getView().getModel("umod");
                var numSum = 0;
                this.byId("table").getSelectedItems().forEach(function(item){
                    var num = Number(item.getCells()[2].getValue());
                    numSum += num;
                });
                oModel.setProperty("/usum", numSum);

                // price sum
                var iRowSum = 0;
                this.byId("table").getSelectedItems().forEach(function(item){
                    var obj = item.getModel().getProperty(item.getBindingContext().getPath());
                    var num = Number(item.getCells()[2].getValue());
                    var price = obj.Mcurr
                    var priceSum = price * num;

                    iRowSum += priceSum;
                });
                oModel.setProperty("/psum", (iRowSum).toLocaleString());
            },

            onTemp: function() {
                var oCartModel = this.getView().getModel('cart') // jsonModel
                oCartModel.setProperty('/', {
                    TotalUnit: 0,
                    TotalSum: 0,
                    cartData: []
                });

                var iTotalSum = 0;
                var iTotalUnit = 0;
                var oCartData = oCartModel.getProperty('/cartData') // []
                var oTable = this.byId('table'),
                    aSelected = oTable.getSelectedItems();

                aSelected.forEach(function(oItem) {
                    var oContext = oItem.getBindingContext(),
                        oData = oTable.getModel()
                                      .getProperty(oContext.getPath());
                    
                    var oNewCartData = oData;
                    oNewCartData.Quantity = oItem.getCells()[2].getValue();
                    iTotalUnit += oNewCartData.Quantity;
                    iTotalSum += ( oNewCartData.Quantity * oNewCartData.Mcurr )

                    oCartData.push(oNewCartData);
                });


                oCartModel.setProperty('/', {
                    TotalUnit: iTotalUnit,
                    TotalSum: iTotalSum.toLocaleString(),
                    cartData: oCartData
                });

                MessageBox.success("???????????? ???????????????.");

            },

            onQuantityChange: function() {
                var oView = this.getView(),
                    oCartModel = oView.getModel('cart'),
                    aCartData = oCartModel.getProperty('/cartData');
                
                var sum = 0;
                var totalUnit = 0;
                aCartData.forEach((item) => {
                    totalUnit += item.Quantity;
                    sum += (item.Quantity * item.Mcurr);
                })
                             
                oCartModel.setProperty('/TotalUnit', totalUnit);
                oCartModel.setProperty('/TotalSum', (sum).toLocaleString() );
              
            },

            onOrder: function() {
                var self = this;

                var oUmodModel = this.getView().getModel('umod'); // ???????????????

                if(oUmodModel.getProperty('/usum') === 0 ) {
                    alert("????????? ?????? ?????? ??????????????????!");
                    return;
                } 
                if(!this.oApproveDialog) {
                    this.oApproveDialog = new Dialog({
                        type: DialogType.Message,
                        title: "????????????",
                        content: new Text({ text: "?????????????????????????" }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "??????",
                            press: function () {
                                
                                // ???????????????~
                                var data = {
                                    Ornum : "1", 
                                    Total : oUmodModel.getProperty('/psum').replaceAll(',', '')
                                };   
                                var odataModel = this.getView().getModel();
                                odataModel.create("/SalesOrderHeaderSet", data, {
                                    success: function(data, response){
                                        odataModel.submitChanges();
                                        self._odataItemRequest(data.Ornum, 0);
                                    }
                                });
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "??????",
                            press: function () {
                                this.oApproveDialog.close();
                            }.bind(this)
                        })
                    });
                }
                this.oApproveDialog.open();
            },

            _odataItemRequest: function(sReturn, i) {
                var aItems = this.getView().byId("table").getSelectedItems();
                var data = {};
                var that = this;

                i = i + 1;

                    var obj = {
                        Ornum : sReturn,
                        Itmnm : i.toString(),
                        Matnm : aItems[i-1].getCells()[0].getText(),
                        Matcd : aItems[i-1].getCells()[1].getText(),
                        Meinm : parseInt(aItems[i-1].getCells()[2].getValue()),
                        Price : aItems[i-1].getCells()[4].getText().replace(',', '')
                    };
                    data = obj;

                    var odataModel = this.getView().getModel();
                    odataModel.create("/SalesOrderItemSet", data, {
                        success: function(data, response){
                            if (i<aItems.length) {
                                that._odataItemRequest(data.Ornum, i)                               
                            }else {
                                odataModel.submitChanges();
                                MessageToast.show("?????????????????????.");
                                that.oApproveDialog.close();

                                that.getOwnerComponent().getRouter().navTo("View2", {}, true);
                            }
                        } 
                    });
            },

            onCartOrder : function() {
                var self = this;

                var oCartModel = this.getView().getModel('cart'); // ???????????????
                if(oCartModel.getProperty('/TotalUnit') === 0 ) {
                    alert("????????? ?????? ?????? ??????????????????!");
                    return;
                } 

                if (!this.oApproveDialog) {
                    this.oApproveDialog = new Dialog({
                        type: DialogType.Message,
                        title: "????????????",
                        content: new Text({ text: "?????????????????????????" }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "??????",
                            press: function () {
                                                        
                                // ???????????????~
                                var data = {
                                    Ornum : "1", 
                                    Total : oCartModel.getProperty('/TotalSum').replaceAll(',', '')
                                };
                                
                                var ocdataModel = this.getView().getModel();
                                ocdataModel.create("/SalesOrderHeaderSet", data, {
                                    success: function(data, response){
                                        ocdataModel.submitChanges();
                                        self._odataCartItemRequest(data.Ornum, 0);
                                    } 
                                });
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "??????",
                            press: function () {
                                this.oApproveDialog.close();
                            }.bind(this)
                        })
                    });
                }
    
                this.oApproveDialog.open();
            },
          
            _odataCartItemRequest: function(sReturn, i) {
               
                var aItems = this.getView().getModel('cart').getProperty('/cartData'); 
                var data = {};
                var that = this;

                i = i + 1;
  
                var obj = {
                    Ornum : sReturn,
                    Itmnm : i.toString(),
                    Matnm : aItems[i-1].Matnm,
                    Matcd : aItems[i-1].Matcd,
                    Meinm : aItems[i-1].Quantity,
                    Price : aItems[i-1].Mcurr.replace(',', '')
                };
                data = obj;
               
                var ocdataModel = this.getView().getModel();
                ocdataModel.create("/SalesOrderItemSet", data, {
                    success: function(data, response){
                        if (i<aItems.length) {
                            that._odataCartItemRequest(data.Ornum, i)
                        }else {
                            ocdataModel.submitChanges();

                            MessageToast.show("?????????????????????.");
                            that.oApproveDialog.close();
                        }                   
                    },
                      error: function(error){console.log(error);
                          sap.m.MessageToast.show("?????? ????????? ?????????.");
                    }
                });
            },

            onCart: function(oEvent) {
                var oButton = oEvent.getSource(),
				oView = this.getView();

                // create popover
                if (!this._pPopover) {
                    this._pPopover = Fragment.load({
                        id: oView.getId(),
                        name: "sync.c203.salesorder.view.Popover",
                        controller: this
                    }).then(function(oPopover){
                        oView.addDependent(oPopover);
                        return oPopover;
                    });
                }

                this._pPopover.then(function(oPopover){
                    oPopover.openBy(oButton);
                });

            },

            /**
             * ?????????????????? ?????? ????????? ????????? ??? ????????? ????????????.
             */
            sumFormat: function( quantity, price ) {
                return (quantity * price).toLocaleString();
            },

            /**
             * ?????????????????? ???????????????
             */
            onDelete: function(oEvent) {

                 var oCartModel = this.getView().getModel('cart');
                 var aCartrow = oCartModel.getProperty('/cartData');
                 
                 var sPath = oEvent.getParameter("listItem").getBindingContextPath(); // ?????????????????? ????????? '/cartData/2' 
                 var idx = sPath.split("/")[2] // ???????????? ?????? ?????????????????? ????????? '/cartData/2' ?????? ?????? ?????? '2'??? ?????????. (type: string)
                              
                aCartrow.splice(idx,1);
                    
                var sum = 0;
                var totalUnit = 0;
                    
                 for(var i = 0 ; i<aCartrow.length; i++) {

                    totalUnit += aCartrow[i].Quantity;
                    sum += (aCartrow[i].Quantity * aCartrow[i].Mcurr);
                            
                    };

                        oCartModel.setProperty('/', {
                        cartData: aCartrow,
                        TotalUnit: totalUnit,
                        TotalSum : sum.toLocaleString() })
                    
            },

            onRouter: function() {
                return decodeURIComponent.getRouterFor(this);
            },

            onNavToView2: function() {
                this.getRouter().naTo("View2");
            }


        });
    });


    