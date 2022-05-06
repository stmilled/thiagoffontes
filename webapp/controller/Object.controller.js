sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, History, formatter, MessageBox) {
    "use strict";

    return BaseController.extend("categories.controller.Object", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit : function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page shows busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({
                    busy : true,
                    delay : 0
                });
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            this.setModel(oViewModel, "objectView");

            
            var oObjectModel = new JSONModel({
                idValue : "",
                idEditable : false,
                nameValue : "",
                nameEditable : false,

                btnCriarVisible : false,
                btnEditarVisible : false,
                btnSalvarVisible : false,
                btnExcluirVisible : false
            });

            this.setModel(oObjectModel, "objectModel");

        },
        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */


        /**
         * Event handler  for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the worklist route.
         * @public
         */


        onCriar: function (){
            debugger;
            var sId = this.getModel("objectModel").getProperty("/idValue");
            var sName = this.getModel("objectModel").getProperty("/nameValue");

            var sMsgCampoVazio = this.getView().getModel("i18n").getResourceBundle().getText("msgCamposObrigatorios");
            var sMsgSucesso = this.getView().getModel("i18n").getResourceBundle().getText("msgSuccess");

            if (!sId || !sName){
                MessageBox.error(sMsgCampoVazio);
                return;
            }

            var iId = parseInt(sId);

            var oPayload = {
                ID : iId,
                Name : sName
            };

            this.getModel().setUseBatch(false);
            
            this.getModel().create("/Categories", oPayload, {
                success: function (oRetorno){
                    MessageBox.success(sMsgSucesso, {
                        onClose: function (oAction){
                            history.go(-1);
                        }
                    });
                }, error: function (oRetorno){
                    debugger;
                }
            });

        },

        onNavBack : function() {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                // eslint-disable-next-line sap-no-history-manipulation
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },

        onEditar: function(){
            this.getModel("objectModel").setProperty("/idEditable", false);
            this.getModel("objectModel").setProperty("/nameEditable", true);

            this.getModel("objectModel").setProperty("/btnCriarVisible", false);
            this.getModel("objectModel").setProperty("/btnEditarVisible", false);
            this.getModel("objectModel").setProperty("/btnSalvarVisible", true);
            this.getModel("objectModel").setProperty("/btnExcluirVisible", false);
        },

        onSalvar: function (){
            var sId = this.getModel("objectModel").getProperty("/idValue");
            var sName = this.getModel("objectModel").getProperty("/nameValue");

            var sMsgCampoVazio = this.getView().getModel("i18n").getResourceBundle().getText("msgCamposObrigatorios");
            var sMsgSucesso = this.getView().getModel("i18n").getResourceBundle().getText("msgSuccess");
            var sMsgConfirm = this.getView().getModel("i18n").getResourceBundle().getText("msgConfirmSave");

            if (!sId || !sName){
                MessageBox.error(sMsgCampoVazio);
                return;
            }

            var iId = parseInt(sId);

            var oPayload = {
                ID : iId,
                Name : sName
            };

            var that = this;

            var fnAtualizar = function (){
                that.getModel().setUseBatch(false);

                that.getModel().update("/Categories(" + sId + ")", oPayload, {
                    success: function (oRetorno) {
                        MessageBox.success(sMsgSucesso, {
                            onClose: function (oAction){
                                history.go(-1);
                            }
                        });
                    }, error: function (oRetorno){
    
                    }
                });
            };

            MessageBox.confirm(sMsgConfirm, {
                actions:  [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (sAction){
                    if (sAction === MessageBox.Action.OK){
                        fnAtualizar();
                    }
                }
            });

        },

        onExcluir: function (){

            var sId = this.getModel("objectModel").getProperty("/idValue");
            var sMsgSucesso = this.getView().getModel("i18n").getResourceBundle().getText("msgSuccess");
            var sMsgConfirm = this.getView().getModel("i18n").getResourceBundle().getText("msgConfirmDelete");
            var sPath = "/Categories(" + sId + ")";

            var that = this;

            var fnExcluir = function(){
                that.getModel().setUseBatch(false);

                that.getModel().remove(sPath, {
                    success: function(){
                        MessageBox.success(sMsgSucesso, {
                            onClose: function (oAction){
                                history.go(-1);
                            }
                        });
                    }, error: function (){
    
                    }
                });
            };

            MessageBox.confirm(sMsgConfirm, {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK){
                        fnExcluir();
                    }
                }
            });

        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched : function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").objectId;

            if (sObjectId === "novo"){
                //modo de criação
                this.getModel("objectModel").setProperty("/btnCriarVisible", true);
                this.getModel("objectModel").setProperty("/btnEditarVisible", false);
                this.getModel("objectModel").setProperty("/btnSalvarVisible", false);
                this.getModel("objectModel").setProperty("/btnExcluirVisible", false);

                this.getModel("objectModel").setProperty("/idEditable", false);
                this.getModel("objectModel").setProperty("/nameEditable", true);

                this.getModel("objectModel").setProperty("/idValue", "");
                this.getModel("objectModel").setProperty("/nameValue", "");

                //remove o busy para o modo de criação
                var oViewModel = this.getModel("objectView");
                oViewModel.setProperty("/busy", false);

                var that = this;

                this.getModel().read("/Categories", {
                    success:function(oData){
                        var vmaior = 0;
                        oData.results.forEach(function(line){
                            if (line.ID > vmaior){
                                vmaior = line.ID;
                            }
                        });
                        vmaior = vmaior + 1;
                        that.getModel("objectModel").setProperty("/idValue", vmaior);
                    }
                });

            } else {
                //modo de exibição
                debugger;
                this.getModel("objectModel").setProperty("/btnCriarVisible", false);
                this.getModel("objectModel").setProperty("/btnEditarVisible", true);
                this.getModel("objectModel").setProperty("/btnSalvarVisible", false);
                this.getModel("objectModel").setProperty("/btnExcluirVisible", true);

                this.getModel("objectModel").setProperty("/idEditable", false);
                this.getModel("objectModel").setProperty("/nameEditable", false);

                var that = this;
                //leitura no oData
                this.getModel().read("/Categories" + sObjectId, {
                    success: function(oRetorno){
                        debugger;
                        var sId = oRetorno.ID;
                        var sName = oRetorno.Name;

                        that.getModel("objectModel").setProperty("/idValue",  sId);
                        that.getModel("objectModel").setProperty("/nameValue", sName);

                    }, error: function (oRetorno){
                        debugger;
                    }
                });


                this._bindView("/Categories" + sObjectId);
            }

        },

        /**
         * Binds the view to the object path.
         * @function
         * @param {string} sObjectPath path to the object to be bound
         * @private
         */
        _bindView : function (sObjectPath) {
            var oViewModel = this.getModel("objectView");

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange : function () {
            var oView = this.getView(),
                oViewModel = this.getModel("objectView"),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }

            var oResourceBundle = this.getResourceBundle(),
                oObject = oView.getBindingContext().getObject(),
                sObjectId = oObject.ID,
                sObjectName = oObject.Categories;

                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/shareSendEmailSubject",
                    oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
                oViewModel.setProperty("/shareSendEmailMessage",
                    oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        }
    });

});
