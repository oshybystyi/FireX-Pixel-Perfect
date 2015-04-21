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

    /**
     * Variables used in old scripts are stored in this.scope
     * this is particularly useful when it is necessary to update
     * window.content variable on switching tab
     */
    this.scope = {};

    this.listener = {
        onWidgetAfterDOMChange: function(aNode) {
            if (aNode.id === firexPixelUi.buttonId) {
                var win = aNode.ownerDocument.defaultView,
                    scope = {
                        window: win,
                        Components: Components,
                        Services: Services
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

                    self.scope = scope;

                    /**
                     * Since we copied from scope.window.content into scope
                     * content - we need to update it every time tab was
                     * switched
                     */
                    self.attachUpdateContentOnTabSelect();
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    };

    /** Don't log the same exceptions twice **/
    this.loggedErrors = [];

    /** Whether event listener for scope['content'] was attached **/
    this.scopeContentUpdateListenerAttached = false;
}

OldScriptsImporter.prototype = {
    addOnUiRegistered: function() {
        CustomizableUI.addListener(this.listener);
    },

    remove: function() {
        CustomizableUI.removeListener(this.listener);

        this.removeUpdateContentOnTabSelect();
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
    attachUpdateContentOnTabSelect: function() {
        if (this.contentUpdateListenerAttached) {
            return;
        }

        var tabContainer = this.scope['window'].gBrowser.tabContainer;

        tabContainer.addEventListener('TabSelect', this.updateContentOnTabSelect.bind(this));

        this.contentUpdateListenerAttached = true;
    },

    removeUpdateContentOnTabSelect: function() {
        var tabContainer = this.scope['window'].gBrowser.tabContainer;

        tabContainer.removeEventListener('TabSelect', this.updateContentOnTabSelect);
    },

    updateContentOnTabSelect: function() {
        this.scope['content'] = this.scope['window'].content;
    }
}

var oldScriptsImporter = new OldScriptsImporter();
