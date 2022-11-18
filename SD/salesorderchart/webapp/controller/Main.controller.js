sap.ui.define([
	"../lib/BaseController",
	"sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("sync.c203.salesorderchart.controller.Main", {
            onInit: function () {
                
                const oComponent = this.getOwnerComponent(),
                      oRouter = oComponent.getRouter();

                this._setInitModel();

                // 20~21을 삭제해야 정상 작동함.
                // oRouter.getRoute("DynamicType")
                //        .attachPatternMatched(this._onPatternMatched,this);

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

            /**
             * 버튼 Press 이벤트
             * 사용자가 해당 이벤트를 발생시키면 이전페이지로 갈수 있도록 한다.
             */
            onNavBackPress: function() {
                /**
                 * parameter - string
                 * 해당 페이지의 이전 페이지 routing name을 넣어준다.
                 */
                this.backPage("Main");
            },

            /** oData 받아온 금액의 누락된 .00 을 KRW로 변환하기 위해 * 100. */
            sum: function(price) {
                return price * 100;
            }
        });
    });
