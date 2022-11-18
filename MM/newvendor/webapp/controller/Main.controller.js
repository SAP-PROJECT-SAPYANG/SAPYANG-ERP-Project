sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/base/Log",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Sorter"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Device, Filter, FilterOperator, Log, JSONModel, MessageToast, MessageBox, Sorter) {
        "use strict";

        return Controller.extend("b0315MM.newvendor.controller.view1", {

            /**
             * 해당 화면이 실행될 때 초기화 작업을 하는 LifeCycle
             * - split App의 기본 홈화면에 Icon 세팅을한다.
             * - 초기 모델을 생성한다.
             * - 초기 모델의 데이터를 세팅한다.
             */
             onInit: function () {
                this._formFragments = {};

                // Set the initial form to be the display one
                // this._showFormFragment("Display");

                this._setInitModel();
                this._setInitModelData(
                    this.getView().getModel('view')
                );
                var oCount = {
                    "count": 0,
                    "wheat_count": 0,
                    "oil_count": 0,
                    "potato_count": 0
                }
                this.getView().setModel(new JSONModel(oCount), "count");


                Device.orientation.attachHandler(this.onOrientationChange, this);
                //우주햄 차트 여기서부터
                const oComponent = this.getOwnerComponent(),
                oRouter = oComponent.getRouter();

                this._setInitModelChart();

            },
            //우주햄 차트 함수시작
            _setInitModelChart: function() {
                let aChartType = this._getChartType();

                this.getView()
                    .setModel(
                        new JSONModel({
                            typeList: aChartType,
                            selectedType: ""
                        }),
                        "DynamicType"
                    );

                // this.getOwnerComponent()
                //     .getModel()
                //     .read("/RatingvendorSet", {
                //         success: function(oData) {
                //             debugger;

                //             this.getView().setModel( new JSONModel(oData), 'test' );
                //             debugger;
                //         }.bind(this),
                //         error: function() {
                //             debugger;
                //         }
                //     })
            },

            onBeforeRendering: function() {
                var oModel   = this.getOwnerComponent().getModel();

                oModel.read("/Newvendor_listSet", {
                    success: function(oData) {
                        this.getView().setModel( new JSONModel(oData), 'bidlist');
                    }.bind(this),
                    error: function(oError) {
                    debugger;
                    }
                })
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
            //우주햄 차트 함수끝

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
             * 해당 프로그램에서 사용할 모델을 초기화 한다.
             */
            _setInitModel: function() {
                this.getView()
                    .setModel(
                        new JSONModel(),
                        'view'
                    )
            },

            _setInitModelData: function(oModel) {
                oModel.setData({
                    "detail1-1": {
                        path: null,
                        data: {},
                        view: {
                            mode: 'display' // display, edit
                        }
                    },
                    "detail2-1": {
                        tableData: []   // Filter 적용을 위해 ratingScoreSet 데이터 변환
                    },
                    "detail3-1": {}
                });
            },

            /**
             * Master Page에서 클릭 했을때 발생하는 이벤트.
             * - 입찰사 조회
             * - 평가 결과
             * - 기타
             * 위 관련 Detail 페이지를 보여준다.
             * @param {sap.ui.base.Event} oEvent
             */
             onListItemPress: function (oEvent) {
                var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
                debugger;
                this.getSplitAppObj().toDetail(this.createId(sToPageId));
            },

            /**
             * Detail Page에서 클릭 했을때 발생하는 이벤트.
             * - 입찰 참여사의 상세 조회를 보여준다.
             */
            onPressDetailItem: function(oEvent) {
                // var oControl = oEvent.getSource(),
                //     oContext = oControl.getBindingContext(),
                //     sPath = oContext.getPath(),
                //     oViewModel = oControl.getModel('view');

                // "/Newvendor_listSet('N220914001')"
                var sSelected = oEvent.oSource.mProperties.description
                var sPath = "/Newvendor_listSet('" + sSelected + "')"
                var oViewModel = this.getView().getModel('view');
                oViewModel.setProperty("/detail1-1/path", sPath);

                var oView = this.getView(),
                    oModel = oView.getModel();

                oModel.read(sPath, {
                    success: function(oData) {
                        debugger;
                        oViewModel.setProperty("/detail1-1/data", oData);

                        this.getSplitAppObj()                   // 스플릿 앱을 가져온다.
                            .to(this.createId("detail1-1"));
                    }.bind(this)
                })

                  // 스플릿 앱에서 detail1-1이라는 id를 가진 페이지로 이동한다.
            },


            /**
             * detail페이지의 상세페이지에서 뒤로가기.
             */
            onPressDetailBack: function () {
                var oView = this.getView(),
                    oViewModel = oView.getModel('view');

                this._setInitModelData(oViewModel);
                this.getSplitAppObj().backDetail();
            },

            /**
             * Detail 페이지를 이동할 때마다 발생하는 이벤트
             * @param {} oEvent
             */
            onAfterDetailNavigate: function(oEvent){

                switch (oEvent.getParameter('to')) {
                    /**
                     * 상세페이지로 돌아온 페이지가 detail 1-1 경우
                     * 해당 페이지에 데이터를 세팅한다.
                     */
                    case this.byId('detail1-1'):
                        this._setBiddingDetail(
                            this.byId('detail1-1')
                        );
                        break;

                    case this.byId('detail2'):
                            this._setDetail2( this.byId('detail2') );
                        break;
                    default:
                        break;
                }
            },

            /**
             * 입찰사 상세조회 페이지 접근시 작동하는 함수.
             * - 상세조회 입찰데이터를 가져온다.
             */
            _setBiddingDetail: function(oView) {
                oView.setBusy(true);

                var oViewModel = oView.getModel('view'),
                    sPath = oViewModel.getProperty('/detail1-1/path');

                oView.getModel()
                     .read(
                        sPath,
                        {
                            success: function(oData) {
                                // debugger;
                                oView.setBusy(false);
                            },
                            error: function(oError) {
                                var sMsg = oError.responseText
                                        ? JSON.parse(oError.responseText).error.message.value
                                        : sPath + "데이터를 가져오는 것에 네트워크 문제가 발생했습니다.";
                                MessageBox.error(sMsg);
                                oView.setBusy(false);
                            }
                        }
                     )
            },

            _setDetail2: function(oView) {
                oView.setBusy(true);

                var oCountModel = oView.getModel('count');
                var oViewModel = this.getView().getModel("view");

                oView.getModel()
                     .read(
                        "/RatingvendorSet",
                        {
                            success: function(oData) {
                                var aResult = oData.results;
                                var aWheat = aResult.filter(function(oItem) {
                                    return oItem.Matcd === '2102001'
                                })
                                var apot = aResult.filter(function(oItem) {
                                    return oItem.Matcd === '2102002'
                                })
                                var aolive = aResult.filter(function(oItem) {
                                    return oItem.Matcd === '2105001'
                                })
                                oCountModel.setProperty('/count', aResult.length);
                                oCountModel.setProperty('/wheat_count', aWheat.length);
                                oCountModel.setProperty('/potato_count', apot.length);
                                oCountModel.setProperty('/oil_count', aolive.length);

                                var wheat_percent = (aWheat.length / aResult.length) * 100;
                                var potato_percent = (apot.length / aResult.length) * 100;
                                var oil_percent = (aolive.length / aResult.length) * 100;

                                oCountModel.setProperty('/wheat_percent', wheat_percent);
                                oCountModel.setProperty('/potato_percent', potato_percent);
                                oCountModel.setProperty('/oil_percent', oil_percent);

                                /**
                                 * 필터 적용을 위해 oData Model을 JSON Model로 변환
                                 */

                                var maxScore = Math.max.apply(
                                    Math, aResult.map(function(o) { return o.Score; }
                                 ));



                                 var aReturns = aResult.map(function(item) {
                                    if(item.Score === maxScore) item.TopScore = true;
                                    else item.TopScore = false;
                                    return item;
                                })

                                oViewModel.setProperty("/tableData", aReturns);

                                oView.setBusy(false);
                            },
                            error: function(oError) {
                                var sMsg = oError.responseText
                                        ? JSON.parse(oError.responseText).error.message.value
                                        : sPath + "데이터를 가져오는 것에 네트워크 문제가 발생했습니다.";
                                MessageBox.error(sMsg);
                                oView.setBusy(false);
                            }
                        }
                     )
            },

            onExit: function () {
                Device.orientation.detachHandler(this.onOrientationChange, this);
            },

            onOrientationChange: function (mParams) {
                var sMsg = "Orientation now is: " + (mParams.landscape ? "Landscape" : "Portrait");
                MessageToast.show(sMsg, { duration: 5000 });
            },

            onPressNavToDetail: function () {
                debugger;
                this.getSplitAppObj().to(this.createId("detail2"));
            },


            onPressMasterBack: function () {
                this.getSplitAppObj().backMaster();
            },

            onPressGoToMaster: function () {
                this.getSplitAppObj().toMaster(this.createId("master2"));
            },
            onPressModeBtn: function (oEvent) {
                var sSplitAppMode = oEvent.getSource().getSelectedButton().getCustomData()[0].getValue();

                this.getSplitAppObj().setMode(sSplitAppMode);
                MessageToast.show("Split Container mode is changed to: " + sSplitAppMode, { duration: 5000 });
            },

            getSplitAppObj: function () {
                var result = this.byId("SplitAppDemo");
                if (!result) {
                    Log.info("SplitApp object can't be found");
                }
                return result;
            },
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Detail.controller에 있던 함수들. datail1-1

            /**
             * Edit 모드를 결정해준다.
             * - 버튼을 활성화 비활성화.
             * - Input값을 활성화 비활성화/
             */
            handleEditPress : function () {
                var oView = this.getView(),
                    oViewModel = oView.getModel('view'),
                    oViewControls = oViewModel.getProperty('/detail1-1/view');

                if(oViewControls.mode === "display"){
                    oViewControls.mode = "edit";
                }else{
                    oViewControls.mode = "display";
                }

                oViewModel.setProperty('/detail1-1/view', oViewControls);
            },

            handleCancelPress : function () {

                var oView = this.getView(),
                    oViewModel = oView.getModel('view'),
                    oViewControls = oViewModel.getProperty('/detail1-1/view');

                if(oViewControls.mode === "edit"){
                    oViewControls.mode = "display";
                    oViewModel.getProperty('/detail1-1/view', oViewControls);
                }else{
                    oViewControls.mode = "display";
                }
                oViewModel.setProperty('/detail1-1/view', oViewControls);

            },

            handleSavePress : function () {     //입찰사 상세 조회 화면에서 저장버튼 클릭시
                var oView = this.getView(),
                oViewModel = oView.getModel('view'),
                oViewControls = oViewModel.getProperty('/detail1-1/view');

                debugger;
                if(oViewControls.mode === "edit"){

                    this._updateCredt(
                        oViewModel
                    );

                    oViewControls.mode = "display";
                    // 저장되었음을 메세지로 알린다.
                    MessageToast.show("저장되었습니다.");
                }else{
                    oViewControls.mode = "display";
                }
                oViewModel.getProperty('/detail1-1/view', oViewControls);
                oViewModel.setProperty('/detail1-1/view', oViewControls);
            },

            _updateCredt: function(oViewModel) {
                var oView = this.getView(),
                    oModel = oView.getModel();

                var sPath = oModel.createKey("/Newvendor_listSet", {
                    Bidno: oViewModel.getProperty('/detail1-1/data/Bidno'),
                });

                var updateData = {
                    Credt: oViewModel.getProperty('/detail1-1/data/Credt')
                };

                oModel.update(
                    sPath,
                    updateData,
                    {
                        success: function() {
                            debugger;
                        },
                        error: function() {
                            debugger;
                        }
                    }
                )
            },

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// detail 2

            onFilterSelect: function (oEvent) {
                var oBinding = this.byId("bidTable").getBinding("items"),
                    sKey = oEvent.getParameter("key"),  //선택된 품목값
                    // Array to combine filters
                    aFilters = [],
                    // Values for Filter
                    wheat = "2102001",
                    potato = "2102002",
                    olive = "2105001",
                    oTabBar = this.getView().byId("idIconTabBar");

                if (sKey === "wheat") {
                    aFilters.push(
                        new Filter({
                            path: "Matcd",
                            operator: FilterOperator.EQ,
                            value1: wheat
                        })
                    );

                } else if (sKey === "potato") {
                    aFilters.push(
                        new Filter("Matcd", "EQ", potato)
                    );
                } else if (sKey === "olive") {
                    aFilters.push(
                        new Filter("Matcd", "EQ", olive)
                    );
                }

                oBinding.filter(aFilters);
                oTabBar.setExpanded(true);  // IconTabBar 펼치기
            },

            onScrollTop: function () {
                // push to top
                var oDetailPage = this.byId("detail2"), // detail2 page get.
                    oDomObject = oDetailPage.getDomRef(); // html detail page soruce.
                    oDomObject.childNodes[1].scrollTo(0,0);
            },

            /**
             * sort 을 해준다.
             * @param {object} oEvent
             * @param {string} sGubun
             */
            onSort: function(oEvent, sGubun) {
                var oControl = oEvent.getSource(),  // 이벤트 주최 컨트롤
                    oParent = oControl.getParent(), // 버튼의 상위 부모
                    oTable = oParent.getParent(); // 툴바의 상위부모
                var bSort = sGubun === 'asc';
                oTable.getBinding("items").sort(
                    new Sorter({
                        path: 'Venna',
                        descending: bSort
                    })
                );

            },

            onSelectionChanged: function(){
                debugger
            }
        });
    });

