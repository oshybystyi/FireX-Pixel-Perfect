
const Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');

/** TODO: refactor into separate files **/
/** link from http://starkravingfinkle.org/blog/2011/01/restartless-add-ons-%E2%80%93-default-preferences/ **/
const PREF_BRANCH = "extensions.firex-pixel.";
const PREFS = {
  firstRun: true
};

function setDefaultPrefs() {
  let branch = Services.prefs.getDefaultBranch(PREF_BRANCH);
  for (let [key, val] in Iterator(PREFS)) {
    switch (typeof val) {
      case "boolean":
        branch.setBoolPref(key, val);
        break;
      case "number":
        branch.setIntPref(key, val);
        break;
      case "string":
        branch.setCharPref(key, val);
        break;
    }
  }
}
/** End of TODO **/

/** TODO: refactoring **/

function startup(data,reason) {
    setDefaultPrefs();

    /*
    Components.utils.import("chrome://myAddon/content/myModule.jsm");
    myModule.startup();  // Do whatever initial startup stuff you need to do
    */
    Cu.import('chrome://FireX-Pixel/content/firexPixelUi.jsm');
    Cu.import('chrome://FireX-Pixel/content/oldScriptsImporter.jsm');

    forEachOpenWindow(loadIntoWindow);
    Services.wm.addListener(WindowListener);
}
function shutdown(data,reason) {
    if (reason == APP_SHUTDOWN)
        return;

    forEachOpenWindow(unloadFromWindow);
    Services.wm.removeListener(WindowListener);

    Cu.unload('chrome://FireX-Pixel/content/oldScriptsImporter.jsm');
    Cu.unload('chrome://FireX-Pixel/content/firexPixelUi.jsm');

    /*
    myModule.shutdown();  // Do whatever shutdown stuff you need to do on addon disable

    Components.utils.unload("chrome://myAddon/content/myModule.jsm");  // Same URL as above
    */

    // HACK WARNING: The Addon Manager does not properly clear all addon related caches on update;
    //               in order to fully update images and locales, their caches need clearing here
    Services.obs.notifyObservers(null, "chrome-flush-caches", null);
}
function install(data,reason) { }
function uninstall(data,reason) { }
function loadIntoWindow(window) {
/* call/move your UI construction function here */

    oldScriptsImporter.addOnUiRegistered();
    firexPixelUi.attach();
}
function unloadFromWindow(window) {
/* call/move your UI tear down function here */

    oldScriptsImporter.remove();
    firexPixelUi.destroy(window);
}
function forEachOpenWindow(todo)  // Apply a function to all open browser windows
{
    var windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements())
        todo(windows.getNext().QueryInterface(Components.interfaces.nsIDOMWindow));
}
var WindowListener =
{
    onOpenWindow: function(xulWindow)
    {
        var window = xulWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                              .getInterface(Components.interfaces.nsIDOMWindow);
        function onWindowLoad()
        {
            window.removeEventListener("load",onWindowLoad);
            if (window.document.documentElement.getAttribute("windowtype") == "navigator:browser")
                loadIntoWindow(window);
        }
        window.addEventListener("load",onWindowLoad);
    },
    onCloseWindow: function(xulWindow) { },
    onWindowTitleChange: function(xulWindow, newTitle) { }
};
