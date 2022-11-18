sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
     function (Controller, JSONModel, MessageToast, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("sync.c203.orderlistlast.controller.orderlist_last", {
            onInit: function () {
                // 모델을 세팅한다.
                this._setInitModel();
                // 전체 총 합계를 구하는 기능
                this._allSumPrice();
                this.getView().setModel(new JSONModel({
                    curr:'KRW',
                    searchControl: {
                        search: "",
                        datePicker: ""
                    }
                }), "view");

                var oTog = {
                    /**
                     * __Normal: 기본, __Create: 생성, __Edit: 수정, __Delete: 삭제,
                     * __CreateItem: 생성, __EditItem: 수정, __DeleteItem: 삭제
                     */
                    stat: "__Normal"
                }
                var oTogModel = new JSONModel(oTog);
                this.getView().setModel(oTogModel, "tog");
            },

            

            onSearch2: function (oEvent) {
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
                var oTable = this.byId("mainTable");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilter);
            },

            aaa: function(oEvent){
                function changeDateToUTC(oDate){ //for sending dates to backend
                    var oTempDate = new Date(oDate.setHours("00","00","00","00"));
                    oDate = new Date(oTempDate.getTime() + oTempDate.getTimezoneOffset() * (-60000));
                    return oDate;
                }

                var oViewModel = this.getView().getModel('view'),
                oViewData = oViewModel.getProperty('/searchControl');
                
                var aFilter = [];
                  if (oViewData.datePicker) {
                    var oSearchFilter = new Filter('Ordat', "EQ", changeDateToUTC(oViewData.datePicker));

                    aFilter.push(oSearchFilter);
                  }
              
                  // update list binding
                  var oTable = this.byId("mainTable");
                  var oBinding = oTable.getBinding("items");
                  oBinding.filter(aFilter);
                debugger;
            },

            /**
             * view model
             */
            _setInitModel: function() {
                this.getView()
                    .setModel(
                        new JSONModel({
                           sum: "0"
                        }),
                        "view"
                    )
            },

            /**
             * 총 합계를 구하는 함수
             */
            _allSumPrice: function() {
                var oComponent = this.getOwnerComponent(),
                    oModel = oComponent.getModel();

                // model.read -> odata model을 읽는다.
                // SalesOrderListSet -> 데이터를 전체 조회
                // { success: function() {} -> 네트워크가 정상적으로 탔을때 }
                // error: function() {} -> 네트워크가 실패했을떄
                oModel.read('/SalesOrderListSet',{
                    success: function(oData) {
                        var aResult = oData.results;
                        var sum = 0;
    

                        // 73에 대한 반복문을 통해서 각 필드에 접근하는데
                        // 필요한 필드인 Price랑 Meinm을 가져와서
                        // 곱한 값을 sum이라는 합계에 더한다.
                        aResult.forEach(function(oItem) {
                            sum += ( oItem.Price * oItem.Meinm ) * 100;
                        });

                        // 다 더해진 값을 모델에 세팅해서
                        // sum이라는 path에 저장시킨다.
                        this.getView()
                            .getModel('view')
                            .setProperty('/sum', sum);
                    }.bind(this)
                })
            },

            onSelectionChange: function (oEvent) {
                this.oSmartVariantManagement.currentVariantSetModified(true);
                this.oFilterBar.fireFilterChange(oEvent);
            },

            onFilterChange: function () {
                this._updateLabelsAndTable();
            },

            onAfterVariantLoad: function () {
                this._updateLabelsAndTable();
            },

            onSearch: function () {
                var oTable = this.getView().byId("mainTable"),
                    oModel = oTable.getBinding("items");
                var oInput = this.getView().byId("search"),
                    sValue = oInput.getValue();

                var oViewModel = this.getView().getModel('view'),
                    oViewData = oViewModel.getProperty('/searchControl');

                var aFilter = [];

                function changeDateToUTC(oDate){ //for sending dates to backend
                    var oTempDate = new Date(oDate.setHours("00","00","00","00"));
                    oDate = new Date(oTempDate.getTime() + oTempDate.getTimezoneOffset() * (-60000));
                    return oDate;
                }

                if(oViewData.search){
                    var oSearchFilter = new Filter("Ornum", "EQ", oViewData.search);

                    aFilter.push(oSearchFilter);
                }

                if(oViewData.datePicker){
                    var oSearchFilter = new Filter('Ordat', "EQ", changeDateToUTC(oViewData.datePicker));

                    aFilter.push(oSearchFilter);
                }

                oModel.filter(aFilter);
            },

            onCreate : function () {
                var oModel = this.getView().getModel(); //oDataModel 객체
                var oViewModel = this.getView().getModel("view"); //view에서 다시 찾아온 것!
                var sSONUM = oViewModel.getProperty("/salesOrderNum");
                var sMemo = oViewModel.getProperty("/salesOrderMemo");
                var oCreateData = {Sonum : sSONUM, Memo : sMemo}; //객체 형태로 생성요청ㄷ
                //  ui5 framework odataV2 모델 api(메소드 기능)으로 생성요청
                 
                oModel.create("/SalesOrderSet", oCreateData,{
                    success : function() {
                        oViewModel.setProperty("/salesOrderNum", null);
                        oViewModel.setProperty("/salesOrderMemo", null);
                        MessageToast.show("저장 되었습니다."); 
                    }
                });//post
                    
                // ui5 framework odatav2 모델 api(메소드 기능)으로 생성요청

            
                // oModel.createEntry("/SalesOrderSet", {
                //     properties : oCreateData
                // });

                // oModel.submitChanges();
            },

            onDelete : function(oEvent){
                //내가 삭제버튼을 누른 엔티티의 상세주소를 추출해서 삭제요청
               
                var sPath = oEvent.getParameter("listItem").
                getBindingContextPath();
                var oModel = this.getView().getModel();

                //Delete http 요청 처리
                oModel.remove(sPath,{ success: function(){
                    MessageToast.show("삭제되었습니다.")
                }})
            },

            onPressEdit : function(){
                this.byId("table").setMode("SingleSelectMaster")
                //싱글셀렉트한 열 하나가 하이라이트 됨 
            },
           
            onPressDel : function(){
                this.byId("table").setMode("Delete")
            },

            onPressItem : function(oEvent){
                var sPath = oEvent.getParameter("listItem").
                getBindingContextPath();
                var oModel = this.getView().getModel();
                var oData = oModel.getProperty(sPath);
                
                var oViewModel = this.getView().getModel("view");
                oViewModel.setProperty("/salesOrderNum", oData.Sonum);
                oViewModel.setProperty("/salesOrderMemo", oData.Memo);
            },
            
            onUpdate : function() {
                var oViewModel = this.getView().getModel("view");
                var sSONUM = oViewModel.getProperty("/salesOrderNum");
                var sMemo = oViewModel.getProperty("/salesOrderMemo");
                var oModel = this.getView().getModel();
                var oData = {Sonum : sSONUM, Memo : sMemo};
                var sPath = "/SalesOrderSet('"+ sSONUM + "')"

                //put (update 요청)
                oModel.update(sPath,oData, {success: function(){
                    MessageToast.show("변경되었습니다.")
                }});
            },

            /**
             * Row 합계 formatter function
             */
            sumFormat: function(price, meinm) {
                var sum = (price * meinm);
                
                return sum.toLocaleString();
            },

            /** 선택 시 총액 합계  */
            onCalc: function() {
                // unit sum
                var oModel = this.getView().getModel("umod");
                var numSum = 0;
                this.byId("mainTable").getSelectedItems().forEach(function(item){
                    var num = Number(item.getCells()[2].getValue());
                    numSum += num;
                });
                oModel.setProperty("/usum", numSum);

                // price sum
                var iRowSum = 0;
                this.byId("mainTable").getSelectedItems().forEach(function(item){
                    var num = Number(item.getCells()[2].getValue());
                    var price = Number(item.getCells()[4].getText());
                    var priceSum = price * num;
                    // console.log(num + " * " + price + " = " + priceSum);
                    iRowSum += priceSum;
                });
                // console.log(iRowSum);
                oModel.setProperty("/psum", iRowSum);
            },

            multipletotal: function(sTotal) {
                return (sTotal * 100).toLocaleString();
            },

            onDeleteMode: function(){
                var oToggleModel = this.getView().getModel("tog");
                oToggleModel.setProperty("/stat", "__Delete");

                this.byId("mainTable").setMode("Delete");
            },

            onDeleteCancel: function() {
                var oToggleModel = this.getView().getModel("tog");
                oToggleModel.setProperty("/stat", "__Normal");

                this.byId("mainTable").setMode("SingleSelectMaster");
            },

            onDeleteData: function(oEvent) {
                var oModel = this.getView().getModel();
                var sPath = oEvent.getParameter("listItem").getBindingContextPath();
                var sKey = oModel.getProperty(sPath).Ornum;
            
                sap.m.MessageBox.confirm("선택된 데이터 : "+ sKey +"\n삭제하시겠습니까?", {
                    title: "식제",                                    // default
                    onClose: function(sAction) {
                        if(sAction !== 'OK'){
                            return;
                        }
                        oModel.remove(sPath, {
                            success: function(){
                                this._allSumPrice();
                                MessageToast.show("삭제 되었습니다.");
                            }.bind(this)
                        });
                    }.bind(this),                                       // default
                    styleClass: "",                                      // default
                    actions: [ 
                        sap.m.MessageBox.Action.OK,
                        sap.m.MessageBox.Action.CANCEL 
                    ],                 // default
                    emphasizedAction: sap.m.MessageBox.Action.OK,        // default
                    initialFocus: null,                                  // default
                    textDirection: sap.ui.core.TextDirection.Inherit     // default
                });
            },
            
            SelectionChange: function(oEvent){
                var oTable = this.getView().byId('mainTable');
                var sFilter = oEvent.getParameter('selectedItem').getKey();
                debugger;
                var aFilter = sFilter ? new Filter("Ortype", "EQ", sFilter) : [];
                
                oTable.getBinding('items').filter(aFilter);
            }
        });
    });


