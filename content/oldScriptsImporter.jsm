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
    var self = this;

    this.listener = {
        onWidgetAfterDOMChange: function(aNode) {
            if (aNode.id === firexPixelUi.buttonId) {
                var win = aNode.ownerDocument.defaultView,
                    scope = {
                        window: win,
                        Components: Components
                    };

                try {
                    /**
                     * Copy all the properties that might be necessary in old
                     * scripts
                     */
                    win.Object.getOwnPropertyNames(win).forEach(function(property) {
                        try {
                            scope[property] = win[property];
                        }
                        catch (e) {
                            /**
                             * Sometimes there are some exceptinos appear
                             * so continue
                             */
                        }
                    });

                    /** Loading sciprts **/
                    Services.scriptloader.loadSubScript('chrome://FireX-Pixel/content/pixelManage.js', scope);
                    Services.scriptloader.loadSubScript('chrome://FireX-Pixel/content/overlay.js', scope);

                    /**
                     * Implementing try catch for every method to log error
                     * stack into console
                     */
                    scope['PixelPerfect'].prototype = self.wrapAllMethods(scope['PixelPerfect'].prototype);
                    scope['PixelManage'].prototype = self.wrapAllMethods(scope['PixelManage'].prototype);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    };

    /** Don't log the same exceptions twice **/
    this.loggedErrors = [];

}

OldScriptsImporter.prototype = {
    addOnUiRegistered: function() {
        CustomizableUI.addListener(this.listener);
    },

    remove: function() {
        CustomizableUI.removeListener(this.listener);
    },

    wrapAllMethods: function(obj) {
        for (let name in obj) {
            let method = obj[name];

            if (typeof method === 'function') {
                obj[name] = this.wrapFunc(method);
            }
        }

        return obj;
    },

    /**
     * Wrap for console logging
     * https://bugsnag.com/blog/js-stacktraces/
     */
    wrapFunc: function(func) {
        var self = this;

        // Ensure we only wrap the function once.
        if (!func._wrapped) {
            func._wrapped = function() {
                try{
                    func.apply(this, arguments);
                } catch(e) {
                    if (self.loggedErrors.indexOf(e) === -1) {
                        /** Haven't yet logged this exception **/
                        self.loggedErrors.push(e);
                        console.error(e);
                    }

                    throw e;
                }
            }
        }
        return func._wrapped;
    }
}

var oldScriptsImporter = new OldScriptsImporter();
