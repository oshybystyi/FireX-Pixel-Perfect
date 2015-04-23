/**
 * Bootstrap.js template is taken from next link
 * https://developer.mozilla.org/en-US/Add-ons/Bootstrapped_extensions
 * but different in way that there is no loadIntoWindow function because
 * CustomizeUI has own events that are fired on ui modification (after new
 * xulWindow openned)
 */

const Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');

function startup(data,reason) {
    Cu.import('chrome://FireX-Pixel/content/ui.jsm');
    Cu.import('chrome://FireX-Pixel/content/oldScriptsImporter.jsm');

    loadDefaultPreferences(data.installPath);
    loadFireXPixel();
}
function shutdown(data,reason) {
    if (reason == APP_SHUTDOWN)
        return;

    unloadFireXPixel();

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
function loadDefaultPreferences(installPath) {
    Cu.import('chrome://FireX-Pixel/content/lib/defaultPreferencesReader.jsm');

    let defaultPreferencesReader = new DefaultPreferencesReader(installPath);
    defaultPreferencesReader.parseDirectory();

    Cu.unload('chrome://FireX-Pixel/content/defaultPreferencesReader.js');
}
function install(data) {
    /** Present here only to avoid warning on addon installation **/
}
function uninstall() {
    /** Present here only to avoid warning on addon removal **/
}