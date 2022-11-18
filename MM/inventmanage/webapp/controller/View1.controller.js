sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/Dialog"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast,UIComponent, MessageBox, History, Filter,FilterOperator, Fragment, Dialog) {
        "use strict";

        return Controller.extend("inventmanage.controller.View1", {
            onInit: function () {
                var oData = {
                    inventmStgcd : null,
                    inventmMatcd : null,
                    inventcVencd : null
                };
                var oCount = {
                    "count": 0,
                    "Ok_count": 0,
                    "Minimum_count": 0,
                    "Danger_count": 0
                };
                var oBtn = {
                    btnVisible : false
                }

                this.fragments = {};

                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "view");
                
                this._setDefaultModel();
                this._setInitModel();
                this._setVendorModel();

                this.getView().setModel(new JSONModel(oCount), "count");
                this.getView().setModel(new JSONModel(oBtn), "btnv");
                
            },

            /**
             * oData -> Json Converting
             */
            _setInitModel: function() {
                var oView = this.getView();
                oView.setBusy(true);

                oView.setModel(
                     new JSONModel({}) ,
                    'dailog' 
                );

                this.getOwnerComponent()
                    .getModel()
                    .read("/InventMSet",{
                        success: function(oData) {
                            oView.setModel( new JSONModel(
                                {
                                    InventMSet: oData.results,
                                    origin: oData.results
                                }
                            ) , 'view');
                            this._setCountDisplay();

                            oView.setBusy(false);
                        }.bind(this),
                        error: function() {
                            oView.setBusy(false);
                        }
                    })
            },
            _setVendorModel: function() {
                var oModel = this.getOwnerComponent().getModel() // odata model
                var oView = this.getView();

                oModel.read("/PurchaseOrderHSet", {
                    success: function(oReturn) {
                        var arr = [];
                        var aItems = oReturn.results.reduce(function(pre, item){
                            if(!pre[item.Vencd]) {
                                pre[item.Vencd] = [];
                                pre[item.Vencd].push(item);
                            } 
                            return pre;
                        }, {});

                        for(var i in aItems) {
                            if(aItems.hasOwnProperty(i)){
                                arr.push({ key : aItems[i][0].Vencd })
                            }
                        }
                        /*
                        arr = [
                            { key : Stgcd값 }
                            { key : Stgcd값 }
                            { key : Stgcd값 }
                            { key : Stgcd값 }
                        ]
                        */

                        oView.setModel(new JSONModel({ vendor : arr }), "ven");
                    }
                })


            },

            _setDefaultModel: function() {
                var oModel = this.getOwnerComponent().getModel() // odata model
                var oView = this.getView();

                oModel.read("/InventMSet", {
                    success: function(oReturn) {
                        var arr = [];
                        var aItems = oReturn.results.reduce(function(pre, item){
                            if(!pre[item.Stgcd]) {
                                pre[item.Stgcd] = [];
                                pre[item.Stgcd].push(item);
                            } 
                            return pre;
                        }, {});

                        for(var i in aItems) {
                            if(aItems.hasOwnProperty(i)){
                                arr.push({ key : aItems[i][0].Stgcd })
                            }
                        }
                        /*
                        arr = [
                            { key : Stgcd값 }
                            { key : Stgcd값 }
                            { key : Stgcd값 }
                            { key : Stgcd값 }
                        ]
                        */

                        oView.setModel(new JSONModel({ contents : arr }), "filter");
                    }
                })
            },
            onFilterSelect: function (oEvent) {
                var oTable = this.getView().byId('table');
                // var iTotal = oTable.getBinding('items').getLength();

                var aSearchFilter = [];
                aSearchFilter = this._getMattypeFieldFilter(aSearchFilter);
                aSearchFilter = this._getSearchFieldFilter(aSearchFilter);
                aSearchFilter = this._getStatusFieldFilter(aSearchFilter);
                // this._setCountDisplay();

                oTable.getBinding('items').filter(aSearchFilter);
                

            },
    
            getRouter: function() {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },

            onNavToView2: function(oEvent) {
                var oTable = this.getView().byId("table");
                if(oTable.mProperties.mode == 'SingleSelectMaster'){
                // var iIndex = oTable.getSelectedIndices()[0];  

                var oViewModel = this.getView().getModel("view");
                var sStgcd = oTable.getSelectedItem().getAggregation('cells')[0].getText();
                var sMatcd = oTable.getSelectedItem().getAggregation('cells')[1].getText();
                debugger;
                // /InventMSet(Stgcd='WH003',Matcd='1101001')

                // if(iIndex === undefined) {   //테이블에서 아무것도 선택안했을 때
                //     // MessageVox 선택하라고 사용자한테 경고창
                //     this.onWarning2MessageBoxPress();

                    
                 
                this.getRouter().navTo("View2", { Stgcd : sStgcd, Matcd : sMatcd })
                
                }
            },
            onWarning2MessageBoxPress: function() {
                var sText = "목록에서 자재를 선택해주세요."
                MessageBox.warning (sText,
                    {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK
                    })
            },

            onSearch : function(){
                this.onSelectionChange();
            },

            /**
             * Search 필드에 존재하는 필터링 기능.
             * 
             */
            _getSearchFieldFilter: function(aFilter) {
                var sKey = this.byId('storage').getSelectedKey();

                if(sKey) {
                    aFilter.push(
                        new Filter("Stgcd", "EQ",  sKey)
                    );
                }

                return aFilter;
            },

            _getStatusFieldFilter: function(aFilter) {
                var sSelectedKey = this.byId('idIconTabBar').getSelectedKey();

                var oFilter;

                switch (sSelectedKey) {
                    case "Ok":
                        oFilter = new Filter("Reinv", "GE", 7000);
                        break;
                
                    case "Minimum":
                        oFilter = new Filter("Reinv", "BT", 5000, 6999);
                        break;

                    case "Danger":
                        oFilter = new Filter("Reinv", "LE", 4999);
                        break;

                    default:
                        break;
                }

                if(oFilter) aFilter.push(oFilter);

                return aFilter;
            },

            _getMattypeFieldFilter: function(aFilter){
                var sKey = this.byId('mattype').getSelectedKey();
                var oTable = this.getView().byId('table');

                switch (sKey) {
                    case "1":
                        aFilter.push(
                            new Filter("Matty", "EQ",  "1")
                        );
                        this.getView().getModel("btnv").setProperty("/btnVisible", true);
                        break;
                    case "2":
                        aFilter.push(
                            new Filter("Matty", "EQ",  "2")
                        );
                        this.getView().getModel("btnv").setProperty("/btnVisible", false);
                        break;
                    case "3":
                        aFilter.push(
                            new Filter("Matty", "EQ",  "3")
                        );
                        this.getView().getModel("btnv").setProperty("/btnVisible", false);
                        break;
                    default:
                        break;
                }

                if (oTable.mProperties.mode == 'MultiSelect') {
                    this.onModeChange();
                }

                return aFilter;
            },

            onSelectionChange : function (oEvent) {
            // 창고코드 검색 filter
                var oTable = this.getView().byId('table');
                
                var aSearchFilter = [];
                aSearchFilter = this._getMattypeFieldFilter(aSearchFilter);
                aSearchFilter = this._getSearchFieldFilter(aSearchFilter);
                aSearchFilter = this._getStatusFieldFilter(aSearchFilter);

                oTable.getBinding('items').filter(aSearchFilter);
                this._setCountDisplay();
                
                
            
            },

            onUpdateFinished : function() {
                // this._setCountDisplay();
            },

            _setCountDisplay: function() {
                var oTable = this.byId('table');
                var aInventMSet = oTable.getModel('view').getProperty('/origin');
                var sStorageKey = this.byId('storage').getSelectedKey();
                var sMattyKey = this.byId('mattype').getSelectedKey();

                

                var origin_count = aInventMSet.filter( (item) => {
                    return ( sStorageKey.length ? item.Stgcd === sStorageKey : [] ) && ( sMattyKey.length ? item.Matty === sMattyKey : [] );
                } )

                var ok_count = aInventMSet.filter( (item) => {
                    return item.Reinv >= 7000 && ( sStorageKey.length ? item.Stgcd === sStorageKey : [] ) && ( sMattyKey.length ? item.Matty === sMattyKey : [] );
                } );

                var minimum_count = aInventMSet.filter( (item) => {
                    return item.Reinv >= 5000 && item.Reinv < 7000 && ( sStorageKey.length ? item.Stgcd === sStorageKey : [] ) && ( sMattyKey.length ? item.Matty === sMattyKey : [] );
                } );

                var danger_count = aInventMSet.filter( (item) => {
                    return item.Reinv < 5000 && ( sStorageKey.length ? item.Stgcd === sStorageKey : [] ) && ( sMattyKey.length ? item.Matty === sMattyKey : [] );
                } );

                oTable.getModel('count').setProperty('/count', origin_count.length);
                oTable.getModel('count').setProperty('/Ok_count', ok_count.length);
                oTable.getModel('count').setProperty('/Minimum_count', minimum_count.length);
                oTable.getModel('count').setProperty('/Danger_count', danger_count.length);

            },

            onModeChange : function (oEvent) {

                var oTable = this.getView().byId('table');
                // table 모드 설정
                if (oTable.mProperties.mode != 'MultiSelect') {
                    oTable.setMode('MultiSelect');            
                    // oTable._fireSelectionChangeEvent;
                    oTable.removeEventDelegate(onselectionchange);

                    // 요청서생성 버튼 enabled = "true"
                    this.getView().byId('Button1').setProperty('pressed', false);
                    this.getView().byId('Button2').setProperty('enabled', true);
                    this.getView().byId('Button2').setProperty('pressed', true);
                } else {
                    oTable.setMode('SingleSelectMaster');
                    this.getView().byId('Button1').setProperty('pressed', true);
                    this.getView().byId('Button2').setProperty('enabled', false);
                    this.getView().byId('Button2').setProperty('pressed', true);
                }

            },

            onDialogPress : function () {
                var oView = this.getView();
                var oDialog = oView.byId("helloDialog");


                function commonDialog(oFunction, oDialog) {
                    oFunction();
                    oDialog.open();
                }

                if (!oDialog) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "inventmanage.view.Dialog",
                        controller: this
                    }).then(function(oDialog) {

                        oView.addDependent(oDialog);
                        commonDialog(this._setDialogModel.bind(this), oDialog);

                    }.bind(this));

                }else{
                    commonDialog(this._setDialogModel.bind(this), oDialog);
                }             
            },

            /**
             * Dialog Model에 데이터를 세팅한다.
             */
            _setDialogModel: function() {
                var oDialogModel = this.getView().getModel('dailog');
                var oToday = new Date();

                var oTable = this.byId('table');
                var oBinding = oTable.getBinding('items');
                var aSelectedItems = oTable.getSelectedItems();

                var oIconTabBar = this.byId("idIconTabBar");
                var oCombobox = this.byId('storage');
                var oComboKey = oCombobox.getSelectedKey();
                var sIconKey = oIconTabBar.getSelectedKey();
                var sOrdState;

                switch (sIconKey) {
                    case "Minimum" : sOrdState = "GENERAL";
                        break;
                    case "Danger" : sOrdState = "SERIOUS";
                        break;
                }

                var oViewModel = this.getView().getModel("view");


                var aList = [];
                aSelectedItems.forEach(function(item) {
                    var sPath = item.getBindingContext('view').getPath();
                    var oRow = oBinding.getModel().getProperty(sPath);
                    var sReinv = 10000 - oRow.Reinv;
                    oRow.Reinv = sReinv;
                    aList.push(oRow);
                });

                oDialogModel.setProperty('/', {
                    orderType: sOrdState,               // 오더타입
                    UserCode: '',                // 고객
                    Today: oToday,               // 주문일자
                    requestDate: new Date(       // 납품요청일
                        oToday.getFullYear(), oToday.getMonth() + 1, oToday.getDate()
                    ),            
                    storage: oComboKey,           // 창고코드
                    selectTableList: aList,
                    vendor: ''
                });

            },
            onVendorSelect: function (oEvent) {
                var oDialogModel = this.getView().getModel('dailog');
                var sVendor = oEvent.getSource().getSelectedKey();

                oDialogModel.setProperty('/vendor', sVendor);

            },

            onRequisition: function () {
                var self = this;
                var oDialogModel = this.getView().getModel('dailog');
                var oCreateModel = this.getView().getModel();

                var data = {
                    Ponum : '1',
                    Otype : oDialogModel.getData().orderType,
                    Vencd : oDialogModel.getData().vendor,
                    Ordat : oDialogModel.getData().Today,
                    Dreqd : oDialogModel.getData().requestDate,
                    Stgcd : oDialogModel.getProperty('/selectTableList')[0].Stgcd,
                    Empnm : '',
                    Stats : '0'

                };

                oCreateModel.create("/PurchaseOrderHSet", data, {
                    success: function (data, response) {
                        self._odataItemRequest(data.Ponum, 0);

                    },
                    error: function(error){
                        MessageBox.error("데이터 생성 중 에러발생");
                    }
                });

                this.onCloseDialog();
            },

            _odataItemRequest: function(sReturn, i) {
                var oDialogModel = this.getView().getModel('dailog');
                var oDataModel = this.getView().getModel();
                var aItems = this.getView().byId("table").getSelectedItems();
                var data = {};
                var that = this;

                i = i+1;
                var sReniv = oDialogModel.getProperty('/selectTableList')[i-1].Reinv;
                var sMatqt = 10000- sReniv;
                var sSMatqt = sMatqt.toString();
                // String(sMatqt);
                    var obj = {
                        Ponum : sReturn,
                        Matcd : oDialogModel.getProperty('/selectTableList')[i-1].Matcd,
                        Matnm : oDialogModel.getProperty('/selectTableList')[i-1].Matnm,
                        Matty : '1',
                        Matqt : sSMatqt,//oDialogModel.getProperty('/selectTableList')[i-1].Reinv,//
                        Munit : '',
                        Price : '1',
                        Waers : 'KRW'
                    };
                    data = obj;
                    debugger;
                    // var oDataModel = this.getModel();
                    oDataModel.create("/PurchaseOrderISet", data, {
                        success : function (data, response) {
                            if (i<aItems.length) {
                                that._odataItemRequest(data.Ponum, i)
                            } else {
                                oDataModel.submitChanges();
                                MessageBox.success("데이터가 성공적으로 저장되었습니다.");

                            }
                        }
                    })

                    

            },
                // onClose event handler of the fragment
            onCloseDialog : function(oEvent) {
                this.getView().byId("helloDialog").close();
                this.getView().byId('Button2').setProperty('pressed', true);

                var oTable = this.byId('table');
                var oBinding = oTable.getBinding('items');
                var aSelectedItems = oTable.getSelectedItems();

                aSelectedItems.forEach(function(item) {
                    var sPath = item.getBindingContext('view').getPath();
                    var oRow = oBinding.getModel().getProperty(sPath);
                    var sReinv = 10000 - oRow.Reinv;
                    oRow.Reinv = sReinv;
                });

            }
        });
    });