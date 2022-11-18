sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
    'sap/ui/comp/smartvariants/PersonalizableInfo',
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
	"sap/m/library",
	"sap/m/List",
    "sap/m/StandardListItem",
	"sap/m/Text"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,Filter,FilterOperator,PersonalizableInfo,JSONModel,Dialog,Button,
                mobileLibrary,List,StandardListItem,Text) {
        "use strict";
        	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

        return Controller.extend("sync.c203.delivery.controller.delivery", {
            onInit: function () {
                this.getView().setModel(new JSONModel({
                    curr:'KRW',
                    searchControl: {
                        search: "",
                        datePicker: ""
                    }
                }), "view") ;

        

                var oModel = new JSONModel();
                this.getView().setModel(oModel, "view");
                
                this._setDefaultModel();

            },

            _setDefaultModel: function() {
                var oModel = this.getOwnerComponent().getModel()
                var oView = this.getView();

                oModel.read("/deliverSet", {
                    success: function(oReturn){
                        var arr = [];
                        var aItems = oReturn.results.reduce(function(pre,item){
                            if(!pre[item.Delst]) {
                                pre[item.Delst] = [];
                                pre[item.Delst].push(item);
                            }
                            return pre;
                        }, {});
                        
                        for(var i in aItems){
                            if(aItems.hasOwnProperty(i)){
                                arr.push({key: aItems[i][0].Delst })
                            }
                        }
                        oView.setModel(new JSONModel({ contents : arr}), "filter");
                    }
                })
            },

            multipletotal: function(sTotal) {
                return (sTotal * 1).toLocaleString();
        },

            onSearch: function (oEvent) {
                // add filter for search
              var aFilter = [];
                var sQuery = oEvent.getSource().getValue();
                if (sQuery) {
                    aFilter.push(
                        new Filter(
                            {
                                path: "Ornum",
                                operator: FilterOperator.EQ,
                                value1: sQuery//,
                                //value2: 
                            }));
                }
                // update list binding
                var oTable = this.byId("Table");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilter);
            },

            onSearch2: function (oEvent) {
                // add filter for search
              var aFilter = [];
                var sQuery = oEvent.getSource().getValue();
                if (sQuery) {
                    aFilter.push(
                        new Filter(
                            {
                                path: "Vennm",
                                operator: FilterOperator.EQ,
                                value1: sQuery//,
                                //value2: 
                            }));
                }
                // update list binding
                var oTable = this.byId("Table");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilter);
            },
            

            onSearch3: function (oEvent) {
                // add filter for search
              var aFilter = [];
                var sQuery = oEvent.getSource().getValue();
                if (sQuery) {
                    aFilter.push(
                        new Filter(
                            {
                                path: "Delst",
                                operator: FilterOperator.EQ,
                                value1: sQuery//,
                                //value2: 
                            }));
                }
                // update list binding
                var oTable = this.byId("Table");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilter);
            },
            
           // 배송상태 검색 filter
            onSelectionChange: function (oEvent) {
                // this.oSmartVariantManagement.currentVariantSetModified(true);
                // this.oFilterBar.fireFilterChange(oEvent);


                // s ->  string '나문자열'
                // a -> array []
                // o -> object {}
                // b -> boolean true , false
                // i -> number 10

                var oTable = this.getView().byId('Table');
                var sFilter = oEvent.getParameter('selectedItem').getKey();

                var aFilter = sFilter ? new Filter("Delst", "EQ", sFilter) : [];

                oTable.getBinding('items').filter(aFilter);
            },

           onDefaultDialogPress: function (oEvent) {
                var oControl = oEvent.getSource(),
                    oParent = oControl.getParent(),
                    oContext = oParent.getBindingContext(),
                    sPath = oContext.getPath(); // -> /SalesSet(0001)

                var oData = oControl.getModel().getProperty(sPath);

                if (!this.oDefaultDialog) {
                    this.oDefaultDialog = new Dialog({
                        title: "주문 상세 내역",
                        contentWidth: "550px",
                        contentHeight: "300px",
                        content: new List({
                            items: {
                                path: '/SalesOrderListSet',
                                template: new StandardListItem({
                                    title: "{Matnm}",
                                    counter: Text text =  "{Meinm}"
                                })
                            }
                        }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "OK",
                            press: function () {
                                this.oDefaultDialog.close();
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "Close",
                            press: function () {
                                this.oDefaultDialog.close();
                            }.bind(this)
                        })
                    });
    
                    // to get access to the controller's model
                    this.getView().addDependent(this.oDefaultDialog);
                }
                
                this.oDefaultDialog.getAggregation('content')[0] // -> List
                                    .getBinding('items')
                                    .filter(
                                        new Filter({
                                            path: "Ornum",
                                            operator: FilterOperator.EQ,
                                            value1: oData.Ornum
                                        })
                                    );

                this.oDefaultDialog.open();
            },
            onSearch0: function (){
                var oTable = this.getView().byId("Table"),
                    oModel = oTable.getBinding("items");
                var oInput = this.getView().byId("search"),
                    sValue = oInput.getValue();
                
                var oViewModel = this.getView().getModeil('view'),
                    oViewData = oViewModel.getProperty('/searchControl');

                var aFilter = [];

                if(oViewData.search){
                    var oSearchFilter = new Filter("Ornum", "EQ", oViewData.search);

                    aFilter.push(oSearchFilter);
                }

                
            }
        });
    });
