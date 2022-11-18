sap.ui.define([], function () {
    "use strict";
    return {
        QuantValue: function(Quant) {
            return Number( (Quant).toFixed(0) );
        }
    };
}); 