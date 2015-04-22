/**
 * Bootstrap.js template is taken from next link
 * https://developer.mozilla.org/en-US/Add-ons/Firefox_for_Android/Initialization_and_Cleanup
 * but different in way that there is no loadIntoWindow function because
 * CustomizeUI has own events that are fired on ui modification (after new
 * xulWindow openned)
 */

const Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');

function startup(data,reason) {
    Cu.import('chrome://FireX-Pixel/content/defaultPrefs.js');
    Cu.import('chrome://FireX-Pixel/content/ui.jsm');
    Cu.import('chrome://FireX-Pixel/content/oldScriptsImporter.jsm');

    setDefaultPrefs();

    loadFireXPixel();
}
function shutdown(data,reason) {
    if (reason == APP_SHUTDOWN)
        return;

    unloadFireXPixel();

    Cu.unload('chrome://FireX-Pixel/content/defaultPrefs.js');
    Cu.unload('chrome://FireX-Pixel/content/oldScriptsImporter.jsm');
    Cu.unload('chrome://FireX-Pixel/content/ui.jsm');

    // HACK WARNING: The Addon Manager does not properly clear all addon related caches on update;
    //               in order to fully update images and locales, their caches need clearing here
    Services.obs.notifyObservers(null, "chrome-flush-caches", null);
}
function loadFireXPixel() {
    oldScriptsImporter.addOnUiRegistered();
    ui.attach();
}
function unloadFireXPixel() {
    oldScriptsImporter.remove();
    ui.destroy();
}
function install() {
    /** Present here only to avoid warning on installation **/
}
function uninstall() {
    /** Present here only to avoid watning on addon removal **/
}