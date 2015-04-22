/**
 * Set default preferences
 * Taken from http://starkravingfinkle.org/blog/2011/01/restartless-add-ons-%E2%80%93-default-preferences/
 * I called this file defaultPrefs.js and not having .jsm extension because it
 * does not have a class, having only one simple function, so doesn't seem like
 * a module to me :)
 * TODO: refactor into more generic system - to read data from default/preferences/firstRun.js
 */

Components.utils.import('resource://gre/modules/Services.jsm');

var EXPORTED_SYMBOLS = ['setDefaultPrefs'];

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