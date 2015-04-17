/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab filetype=javascript: */

'use strict';

var EXPORTED_SYMBOLS = ['firexPixelUi'];

const Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');

/** CustomizableUI used to create toolbar button **/
Cu.import('resource:///modules/CustomizableUI.jsm');

const { AREA_PANEL, AREA_NAVBAR } = CustomizableUI;

/** Xul.js used to define set of functions similar to tags of overlay.xul **/
Cu.import('chrome://FireX-Pixel/content/lib/xul.js');

defineTags(
    'panel', 'vbox', 'hbox', 'description',
    'html:input', 'label', 'textbox', 'button'
);

const {
    PANEL, VBOX, HBOX, DESCRIPTION,
    HTMLINPUT, LABEL, TEXTBOX, BUTTON
} = Xul;

/**
 * Add and remove addon user interface - replacement over overlay.xul, which
 * can't be ported into restartless extension
 */
function FirexPixelUi() {
    this.panelNode = null;
    this.buttonId = 'toolbar-pixel';

    /** Css components initialization **/
    this.sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
        .getService(Components.interfaces.nsIStyleSheetService);
    let ios = Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);
    this.cssUri = ios.newURI("chrome://FireX-Pixel/skin/ui.css", null, null);

    /** Import localization properties **/
    this.stringBundle = Services.strings.createBundle('chrome://FireX-Pixel/locale/ui.properties?' + Math.random()); // Randomize URI to work around bug 719376
}

FirexPixelUi.prototype = {
    attach: function () {
        this.sss.loadAndRegisterSheet(this.cssUri, this.sss.AUTHOR_SHEET);

        this.createToolboxButton();
    },

    destroy: function () {
        CustomizableUI.destroyWidget(this.buttonId);
        if(this.sss.sheetRegistered(this.cssUri, this.sss.AUTHOR_SHEET))
            this.sss.unregisterSheet(this.cssUri, this.sss.AUTHOR_SHEET);
    },

    createToolboxButton: function () {
        var self = this; 
        CustomizableUI.createWidget({
            id: this.buttonId,
            defaultArea: CustomizableUI.AREA_NAVBAR,
            label: this.stringBundle.GetStringFromName('firexPixel.tooltip_button'),
            tooltiptext: this.stringBundle.GetStringFromName('firexPixel.tooltip_button'),
            onCommand: function(aEvent) {
                //var thisDOMWindow = aEvent.target.ownerDocument.defaultView; //this is the browser (xul) window
                /*
                var thisWindowsSelectedTabsWindow = thisDOMWindow.gBrowser.selectedTab.linkedBrowser.contentWindow; //this is the html window of the currently selected tab
                thisWindowsSelectedTabsWindow.alert('alert from html window of selected tab');
                */
                
                if (self.panelNode === null) {
                    self.panelNode = self.createPanel(aEvent.target);
                }

                self.panelNode.openPopup(aEvent.target);
            }
        });
    },

    createPanel: function (elem) {
        let panel =
            PANEL({'id': 'thepanel', 'type': 'arrow'},
                HBOX({'align': 'start'},
                    VBOX(
                        HBOX({'class': 'pixel-hbox'},
                            DESCRIPTION({'value': this.stringBundle.GetStringFromName('firexPixel.opacity')}),
                            HTMLINPUT({'id': 'opacity-range', 'type': 'range', 'min': '0', 'max': '10'})
                        ),
                        HBOX({'id': 'pixel-coords', 'class': 'pixel-hbox'},
                            LABEL({'control': 'coord-x', 'value': 'X:'}),
                            TEXTBOX({'id': 'coord-x', 'class': 'coord-box', 'placeholder' : '0'}),
                            LABEL({'control': 'coord-y', 'value': 'Y:'}),
                            TEXTBOX({'id': 'coord-y', 'class': 'coord-box', 'placeholder': '0'})
                        ),
                        BUTTON({'id': 'upload-layout', 'class': 'pixel-button', 'label': this.stringBundle.GetStringFromName('firexPixel.upload_layout')}),
                        HBOX({'id': 'pixel-layout', 'class': 'pixel-hbox'},
                            DESCRIPTION({'value': this.stringBundle.GetStringFromName('firexPixel.not_loaded')})
                        ),
                        HBOX({'id': 'tools_panel'},
                            VBOX({'class': 'buttons-wrap'},
                                BUTTON({'id': 'tools_add', 'class': 'pixel-button', 'label': this.stringBundle.GetStringFromName('firexPixel.add_layout')}),
                                BUTTON({'id': 'tools_remove', 'class': 'pixel-button', 'label': this.stringBundle.GetStringFromName('firexPixel.delete_layout')})
                            ),
                            VBOX({'class': 'buttons-wrap'},
                                BUTTON({'id': 'tools_transparent', 'class': 'pixel-button', 'label': this.stringBundle.GetStringFromName('firexPixel.transparent_layout')})
                            )
                        )
                    )
                )
            );

        return panel.build(elem);
    }

}

/** Singleton to avoid multiple initialization for startup and shutdown **/
var firexPixelUi = new FirexPixelUi();
