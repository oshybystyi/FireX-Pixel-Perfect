/**
 * Bootstrap.js template is taken from next link
 * https://developer.mozilla.org/en-US/Add-ons/Bootstrapped_extensions
 * but different in way that there is no loadIntoWindow function because
 * CustomizeUI has own events that are fired on ui modification (after new
 * xulWindow openned)
 */

const Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');

const extensionLink = 'chrome://FireX-Pixel/',
      contentLink = extensionLink + 'content/',
      uiModuleLink = contentLink + 'ui.jsm',
      oldScriptsModuleLink = contentLink + 'oldScriptsImporter.jsm',
      defaultPreferencesLoaderLink = contentLink + 'lib/defaultPreferencesLoader.jsm';

function startup(data,reason) {
    Cu.import(uiModuleLink);
    Cu.import(oldScriptsModuleLink);

    loadDefaultPreferences(data.installPath);
    loadFireXPixel();
}
function shutdown(data,reason) {
    if (reason == APP_SHUTDOWN)
        return;

    unloadDefaultPreferences();
    unloadFireXPixel();

    Cu.unload(oldScriptsModuleLink);
    Cu.unload(uiModuleLink);

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
    Cu.import(defaultPreferencesLoaderLink);

    this.defaultPreferencesLoader = new DefaultPreferencesLoader(installPath);
    this.defaultPreferencesLoader.parseDirectory();
}
function unloadDefaultPreferences() {
    this.defaultPreferencesLoader.clearDefaultPrefs();

    Cu.unload(defaultPreferencesLoaderLink);
}
function install(data) {
    /** Present here only to avoid warning on addon installation **/
}
function uninstall() {
    /** Present here only to avoid warning on addon removal **/
}