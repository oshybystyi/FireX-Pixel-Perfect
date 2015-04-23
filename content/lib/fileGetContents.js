/**
 * Set of instructions to read from nsIFile
 * Taken from https://developer.mozilla.org/en-US/Add-ons/Code_snippets/File_I_O
 * Named it in php style :)
 */

var EXPORTED_SYMBOLS = ['fileGetContents'];

function fileGetContents(file) {
    var data = "";
    var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].
        createInstance(Components.interfaces.nsIFileInputStream);
    var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
        createInstance(Components.interfaces.nsIConverterInputStream);
    fstream.init(file, -1, 0, 0);
    cstream.init(fstream, "UTF-8", 0, 0); // you can use another encoding here if you wish

    let (str = {}) {
        let read = 0;
        do { 
            read = cstream.readString(0xffffffff, str); // read as much as we can and put it in str.value
            data += str.value;
        } while (read != 0);
    }
    cstream.close(); // this closes fstream

    return data;
}