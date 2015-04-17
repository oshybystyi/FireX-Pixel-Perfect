
const Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');

function startup(data,reason) {
    /*
    Components.utils.import("chrome://myAddon/content/myModule.jsm");
    myModule.startup();  // Do whatever initial startup stuff you need to do
    */
    Cu.import('chrome://FireX-Pixel/content/firexPixelUi.jsm');

    forEachOpenWindow(loadIntoWindow);
    Services.wm.addListener(WindowListener);
}
function shutdown(data,reason) {
    if (reason == APP_SHUTDOWN)
        return;

    forEachOpenWindow(unloadFromWindow);
    Services.wm.removeListener(WindowListener);

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

    firexPixelUi.attach();
}
function unloadFromWindow(window) {
/* call/move your UI tear down function here */

    firexPixelUi.destroy();
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
