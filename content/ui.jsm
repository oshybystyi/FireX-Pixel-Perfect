/* -*- Mode: Javascript; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab filetype=javascript: */

'use strict';

var EXPORTED_SYMBOLS = ['ui'];

const Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');

/** CustomizableUI used to create toolbar button **/
Cu.import('resource:///modules/CustomizableUI.jsm');

/** Log into console (also shown in terminal that runs firefox **/
Cu.import("resource://gre/modules/devtools/Console.jsm");

/** Xul.js used to define set of functions similar to tags of overlay.xul **/
Cu.import('chrome://FireX-Pixel/content/lib/xul.js');

defineTags(
    'panel', 'vbox', 'hbox', 'description',
    'html:input', 'label', 'textbox', 'button',
    'toobarbutton'
);

const {
    PANEL, VBOX, HBOX, DESCRIPTION,
    HTMLINPUT, LABEL, TEXTBOX, BUTTON,
    TOOLBARBUTTON
} = Xul;

/**
 * Add and remove addon user interface - replacement over overlay.xul, which
 * can't be ported into restartless extension
 */
function Ui() {
    this.panelNode = null;
    this.buttonId = 'toolbar-pixel';

    /** Css components initialization **/
    this.sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
        .getService(Components.interfaces.nsIStyleSheetService);
    let ios = Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);
    this.cssUri = ios.newURI("chrome://FireX-Pixel/skin/overlay.css", null, null);

    /** Import localization properties **/
    this.stringBundle = Services.strings.createBundle('chrome://FireX-Pixel/locale/overlay.properties?' + Math.random()); // Randomize URI to work around bug 719376
}

Ui.prototype = {
    attach: function() {
        this.sss.loadAndRegisterSheet(this.cssUri, this.sss.AUTHOR_SHEET);

        this.createOverlay();
    },

    destroy: function() {
        CustomizableUI.destroyWidget(this.buttonId);
        if(this.sss.sheetRegistered(this.cssUri, this.sss.AUTHOR_SHEET))
            this.sss.unregisterSheet(this.cssUri, this.sss.AUTHOR_SHEET);
    },

    createOverlay: function() {
        var self = this; 

        CustomizableUI.createWidget({
            id: this.buttonId,
            defaultArea: CustomizableUI.AREA_NAVBAR,
            type: 'custom',
            onBuild: function(doc) {
                try {
                    var overlay = self.overlayNode(doc);
                }
                catch (e) {
                    console.error(e);
                }

                return overlay;
            }
        });
    },

    overlayNode: function(doc) {
        let toolbarButtonAttrs = {
            id: this.buttonId,
            type: 'menu',
            label: this.stringBundle.GetStringFromName('firexPixel.tooltip_button'),
            tooltiptext: this.stringBundle.GetStringFromName('firexPixel.tooltip_button'),
            class: 'toolbarbutton-1 chromeclass-toolbar-additional'
        };

        var overlay =
            TOOLBARBUTTON(toolbarButtonAttrs,
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
                            VBOX({'id': 'tools_panel'},
                                HBOX({'class': 'buttons-wrap'},
                                    BUTTON({'id': 'tools_add', 'class': 'pixel-button', 'label': this.stringBundle.GetStringFromName('firexPixel.add_layout')}),
                                    BUTTON({'id': 'tools_remove', 'class': 'pixel-button', 'label': this.stringBundle.GetStringFromName('firexPixel.delete_layout')})
                                ),
                                HBOX({'class': 'buttons-wrap'},
                                    BUTTON({'id': 'tools_transparent', 'class': 'pixel-button', 'label': this.stringBundle.GetStringFromName('firexPixel.transparent_layout')})
                                )
                            )
                        )
                    )
                )
            );

        return overlay.build(doc);
    }

}

/** Singleton to avoid multiple initialization for startup and shutdown **/
var ui = new Ui();