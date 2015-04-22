/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab filetype=javascript: */

'use strict';

var EXPORTED_SYMBOLS = ['oldScriptsImporter'];

const { utils: Cu, interfaces: Ci } = Components;

Cu.import('resource://gre/modules/Services.jsm');

/** CustomizableUI used to create toolbar button **/
Cu.import('resource:///modules/CustomizableUI.jsm');

Cu.import('chrome://FireX-Pixel/content/firexPixelUi.jsm');

/** Log into terminal that runs firefox **/
Cu.import("resource://gre/modules/devtools/Console.jsm");

function OldScriptsImporter() {
    /**
     * TODO: use window instead of scope
     * this would lead to possibility of removing TabSelect event listener
     * but need to manually remove PixelPerfect and PixelManage objects from
     * xulWindow
     */

    var self = this;

    this.uiListener = {
        onWidgetAfterDOMChange: function(aNode) {
            if (aNode.id === firexPixelUi.buttonId) {
                var xulWindow = aNode.ownerDocument.defaultView,
                    scope = {
                        window: xulWindow,
                        Components: Components,
                        Services: Services
                    };

                try {
                    /**
                     * Copy all the properties that might be necessary in old
                     * scripts
                     */
                    xulWindow.Object.getOwnPropertyNames(xulWindow).forEach(function(property) {
                        try {
                            if (property !== '_content') {
                                /** Avoid deprecation warning in console **/
                                scope[property] = xulWindow[property];
                            }
                        }
                        catch (e) {
                            /**
                             * Sometimes there are some exceptinos appear
                             * so continue
                             */
                        }
                    });

                    /** Write errors to terminal **/
                    scope['console'] = console;

                    /** The scope['btoa'] didn't work for unknown reason **/
                    scope['btoa'] = btoa;

                    /** Loading sciprts **/
                    Services.scriptloader.loadSubScript('chrome://FireX-Pixel/content/pixelManage.js', scope);
                    Services.scriptloader.loadSubScript('chrome://FireX-Pixel/content/overlay.js', scope);

                    /**
                     * Implementing try catch for every method to log error
                     * stack into console
                     */
                    scope['PixelPerfect'].prototype = self.wrapAllMethods(scope['PixelPerfect'].prototype);
                    scope['PixelManage'].prototype = self.wrapAllMethods(scope['PixelManage'].prototype);

                    /**
                     * Store the scope in xulWindow, previously used
                     * this.scope but run into problem when multiple windows
                     * are openned
                     */
                    xulWindow.oldOverlayScriptsScope = scope;

                    /**
                     * Since we copied from scope.window.content into scope
                     * content - we need to update it every time tab was
                     * switched
                     */
                    self.attachUpdateContentOnTabSelect(xulWindow);
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
        CustomizableUI.addListener(this.uiListener);
    },

    remove: function() {
        CustomizableUI.removeListener(this.uiListener);

        this.foreachWindow(this.removeAppliedLayers);
        this.foreachWindow(this.removeUpdateContentOnTabSelect);
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
                    return func.apply(this, arguments);
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
    },

    /**
     * It is necessary to update this.scope['content'] on tab switch
     */
    attachUpdateContentOnTabSelect: function(xulWindow) {
        if (xulWindow.oldOverlayScriptsScope.contentUpdateListenerAttached) {
            /**
             * Flag whether scope.content update tab select listener have been
             * attached
             */
            return;
        }

        var tabContainer = xulWindow.gBrowser.tabContainer;

        tabContainer.addEventListener('TabSelect', this.updateContentOnTabSelect.bind(undefined, xulWindow.oldOverlayScriptsScope));

        xulWindow.oldOverlayScriptsScope.contentUpdateListenerAttached = true;
    },

    /**
     * Remove event listeners to update scope content variable
     */
    removeUpdateContentOnTabSelect: function(xulWindow) {
        let tabContainer = xulWindow.gBrowser.tabContainer;

        tabContainer.removeEventListener('TabSelect', this.updateContentOnTabSelect.bind(undefined, xulWindow.oldOverlayScriptsScope));

        xulWindow.oldOverlayScriptsScope.contentUpdateListenerAttached = false;
    },

    /**
     * Func that updates scope content variable.
     * Made a separate function for this to be able to remove listener
     */
    updateContentOnTabSelect: function(scope) {
        scope['content'] = scope['window'].content;
    },

    /**
     * Force remove of applied layer to content DOM
     */
    removeAppliedLayers: function(xulWindow) {
        /** Iterate over all tabls **/
        xulWindow.gBrowser.browsers.forEach(function(browser) {
            xulWindow.oldOverlayScriptsScope.PixelManage.prototype.removeFromDOM(browser.contentWindow);
        });
    },

    /**
     * Iterate over all windows and run some func
     */
    foreachWindow: function(func) {
        let windows = Services.wm.getEnumerator("navigator:browser");
        while (windows.hasMoreElements()) {
            let xulWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);

            func.call(this, xulWindow);
        }
    }

}

var oldScriptsImporter = new OldScriptsImporter();