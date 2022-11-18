sap.ui.define([
	"sap/ushell/services/AppConfiguration",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
    "sap/viz/ui5/format/ChartFormatter",
    'sap/viz/ui5/api/env/Format',
	"sap/ui/core/Fragment"
], function( 
	AppConfiguration,
	Controller,
	History,
	ChartFormatter,
	Format,
	Fragment 
) {
	"use strict";
	
	return Controller.extend("sync.c203.salesorderchart.lib.Base", {
		/**
		 * 쉘 컨트롤 레터박스 전체화면 설정
		 */
		onResizeScreenPress: function() {
			var oModel, icon, isFull;
			
			//  앱 모델 얻기
            oModel =  this.getOwnerComponent().getModel("app");
            icon = oModel.getProperty("/screenSizeButton");
            // 현재 상태에 따라 아이콘 변경
            if (icon === "sap-icon://full-screen") {
				icon = "sap-icon://exit-full-screen";
				isFull = true;
            } else {
				icon = "sap-icon://full-screen";
				isFull = false;
            }
            oModel.setProperty("/screenSizeButton", icon);
            AppConfiguration.setApplicationFullWidth(isFull);
        },
		
		/**
		 * 공용 routing 제공 함수
		 * 다음 페이지 이동
		 * {
		 * 		path		- string - next Page
		 * 		parameter	- object - url parameter options
		 * }
		 * @param {object} oParam 
		 */
		nextPage: function(oParam) {	
			const oRouter = this.getOwnerComponent()
								.getRouter();

			oRouter.navTo(oParam.path, oParam.parameter);
		},

		/**
		 * 공용 routing 제공 함수
		 * 이전 페이지 이동
		 * @param {string} sStartPage 
		 * sStartPage - 돌아갈 페이지가 없을 경우 해당 페이지의 이전 routing Name을 사용
		 * 			    일반적으로 뒤로가기는 브라우저 내의 기록으로 찾아서 뒤로가지만
		 * 			    새로고침을 할 경우 기록이 없어지기때문에 뒤로가기버튼을 눌렀을 때 동작 안 할 수가 있어서 대비
		 */
		backPage: function(sStartPage) {
			let oHistory, sPreviousHash;
			const oComponent = this.getOwnerComponent(),
				  oRouter = oComponent.getRouter();

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				if( sStartPage ) oRouter.navTo(sStartPage, {}, true);
			}
		},
		
		/**
		 * (view / Fragment / Block)에서 control을 가져오는 함수
		 * @param {object} oParam 가져오고 싶은 컨트롤 정보 (각각 아래와 같음)
		 * view
		 *  - string		- view에서 찾을 control id
		 * Fragment
		 *  - {
		 *		alias		- Fragment 별칭
		 *		controlid	- control의 id
		 *	  }
		 * Block
		 *  - {
		 *		blockid		- view에서 Block의 id
		 *		controlid	- control의 id
		 *	  }
		 * @return {control} 찾고자하는 Control Object
		**/
		getControl: function(oParam) {
			var oControl;
			if(oParam.alias){
				oControl = sap.ui.core.Fragment.byId(this.getView().createId(oParam.alias),oParam.controlid);
			} else if (oParam.blockid){
				oControl = this.byId(this.getView().byId(oParam.blockid).getAssociation("selectedView")).byId(oParam.controlid);
			} else {
				oControl = this.getView().byId(oParam);
			}
			return oControl;
		},

		/**
		 * OData를 호출해서 JSONModel로 변환한다.
		 * @param {object} oParam
		 * {
		 * 		model			- object - v2.odata model
		 * 		path			- string - odata entitySet Path
		 * 		filter			- array  - sap.ui.model.Filter
		 * 		urlParameters	- object - odata url options
		 * 		busyControl		- obejct - control
		 * 		callback		- function - callback function 
		 * 		jsonModel		- obejct - jsonModel
		 * }
		 */
		_convertODataToJSON: function(oParam) {
			oParam.busyControl.setBusy(true);

			oParam.model.read(oParam.path, {
				filters: oParam.filter || [],
				urlParameters: oParam.urlParameters || {},
				success: function(oData) {
					let vResult = oData.hasOwnProperty('results') ? oData.results : oData;
					if(oParam.callback && typeof oParam.callback === 'function') {
						oParam.callback(vResult, oParam.jsonModel);
					}

					oParam.busyControl.setBusy(false);
				},
				error: function() {
					oParam.busyControl.setBusy(false);
				}
			});
		},

		/**
		 * VizFrame Property Setting
		 * 차트 기본 세팅 함수 및 popover 세팅
		 * 예시) 라벨, 색상, 데이터 라벨 ... 등
		 * @param {object} oParam 
		 * {
		 * 		- controlid		- string	- chart Id
		 * 		- popoverid		- string	- popover Id
		 * 		- properties	- object	- vizFrame property options
		 * }
		 */
		 setVizFrameSetting: function(oParam) {
			Format.numericFormatter(ChartFormatter.getInstance());
			const oView = this.getView(),
				  oChart = oView.byId(oParam.controlid),
				  oPopOver = oView.byId(oParam.popoverid);
			
			
			let defaultProperty = {
				title: {
					visible: true,
					style: {
						color: 'red'
					},
					text: "템플릿 차트"

				},

				legend: {
					drawingEffect: 'glossy' //'normal, glossy'
				},

				plotArea: {
					drawingEffect: 'glossy',
					dataLabel: {
						visible: true
					}
				}
			};

			let oProperties = oParam.properties || defaultProperty;
			
			oChart.setVizProperties(oProperties);
			oPopOver.connect(oChart.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
		},

		/**
		 * Fragment를 가져온다.
		 * @param {object} oParam 
		 * {
		 * 		fragmentName		- string	- fragment 이름
		 * 		controller			- object	- 사용할 controller 객체
		 * 		handler				- function	- 뒤 처리를 진행할 후단 처리용 callback function
		 * }
		 */
		_loadFragment: function(oParam) {
			const oComponent = this.getOwnerComponent();

			if(!this._oFragments){
				this._oFragments = {};
			}

			if (!this._oFragments[oParam.fragmentName]) {
				Fragment.load({
					id: this.getView().createId(oParam.fragmentName.toLowerCase()),
					name: oComponent.getManifestEntry("/sap.app/id") + ".view.fragment." + oParam.fragmentName,
					controller: oParam.controller
				}).then(function (oFragment) {
					this._oFragments[oParam.fragmentName] = oFragment;
					if (oParam.handler && typeof oParam.handler === "function") oParam.handler(oFragment);
				}.bind(this));
			} else {
				if (oParam.handler && typeof oParam.handler === "function") oParam.handler(this._oFragments[oParam.fragmentName]);
			}
		},
	});
});