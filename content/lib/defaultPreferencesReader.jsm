
const Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');

Cu.import('resource://gre/modules/FileUtils.jsm');

/**
 * Relative import used here in case component will be used in some other
 * project
 */
Cu.import('resource://gre/modules/XPCOMUtils.jsm');
XPCOMUtils.importRelative(this, 'fileGetContents.js');

var EXPORTED_SYMBOLS = ['DefaultPreferencesReader'];

/**
 * Read defaults/preferences/* and set Services.pref default branch
 */
function DefaultPreferencesReader(installPath) {
    this.reg = new RegExp(
            "pref\\(" +
                "[\"']" +
                    "([\\w-\\.]+\\.)" + // branch (captured)
                    "(\\w+)" + // key (captured)
                "[\"']" +
                ",\\s*" + // divider before value
                "(.+)" + // value (captured)
            "\\)"
    , 'gm');

    ['defaults', 'preferences'].forEach(function(dir) {
        installPath.append(dir);
    });

    if (installPath.exists() !== true) {
        throw new DefaultsDirectoryMissingError(installPath);
    }

    this.readFrom = installPath;
} 

DefaultPreferencesReader.prototype = {
    parseDirectory: function() {
        let entries = this.readFrom.directoryEntries;

        while (entries.hasMoreElements()) {
            let entryData = fileGetContents(entries.getNext());

            this.parseData(entryData);
        }
    },

    /**
     * The algorithm is mostly taken from
     * Taken from http://starkravingfinkle.org/blog/2011/01/restartless-add-ons-%E2%80%93-default-preferences/
     */
    parseData: function(data) {
        let matches = [];

        while ((matches = this.reg.exec(data)) !== null) {
            let { 1: branchName, 2: key, 3: value } = matches,
                branch = Services.prefs.getDefaultBranch(branchName);

            value = eval(value);

            switch (typeof value) {
                case "boolean":
                    branch.setBoolPref(key, value);
                    break;
                case "number":
                    branch.setIntPref(key, value);
                    break;
                case "string":
                    branch.setCharPref(key, value);
                    break;
            }
        }
    }

};

/**
 * Exception type on missing defaults/preferences folder
 */
function DefaultsDirectoryMissingError(installPath) {
    this.name = 'DefaultsDirectoryMissingError';
    this.message = '\'' + installPath.path + '\' does no exist';
}

/** Inherit from Error for error stack and pretty output in terminal **/
DefaultsDirectoryMissingError.prototype = new Error();