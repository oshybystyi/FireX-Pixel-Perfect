/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab filetype=javascript: */

'use strict';

var EXPORTED_SYMBOLS = ['oldScriptsImporter'];

const Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');

/** CustomizableUI used to create toolbar button **/
Cu.import('resource:///modules/CustomizableUI.jsm');

Cu.import('chrome://FireX-Pixel/content/firexPixelUi.jsm');

/** TODO: think about removing that **/
Cu.import("resource://gre/modules/devtools/Console.jsm");

function OldScriptsImporter() {
    this.listener = {
        onWidgetAfterDOMChange: function(aNode) {
            if (aNode.id === firexPixelUi.buttonId) {
                var win = aNode.ownerDocument.defaultView;
                var scope = {
                    window: win,
                    document: win.document,
                    content: win.content,
                    Components: Components
                };

                try {
                    Services.scriptloader.loadSubScript('chrome://FireX-Pixel/content/pixelManage.js', scope);
                    Services.scriptloader.loadSubScript('chrome://FireX-Pixel/content/overlay.js', scope);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    };
}

OldScriptsImporter.prototype = {
    addOnUiRegistered: function() {
        CustomizableUI.addListener(this.listener);
    },
    remove: function() {
        CustomizableUI.removeListener(this.listener);
    }
}

var oldScriptsImporter = new OldScriptsImporter();
