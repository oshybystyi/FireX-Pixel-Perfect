if(wrapper == undefined)
{
    var wrapper = {};
}

var PixelPerfect = function()
{
    this.toolbarItem = "toolbar-pixel";
    this.ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    this.localFile = null;
    this.pixelManager = null;
}
PixelPerfect.prototype.onload = function()
{
    if(this.isFirstRun())
    {
        this.addIcon("nav-bar", this.toolbarItem);
        this.addIcon("addon-bar", this.toolbarItem);
    }

    var self = this;

    var tools_add = document.getElementById("tools_add");
    var tools_remove = document.getElementById("tools_remove");
    if(tools_add)
    {
        tools_add.addEventListener("click", function() {
            if(self.pixelManager)
            {
                self.pixelManager.init();
                self.pixelManager.addToDOM(self.localFile.leafName);
            }
        });
    }

    if(tools_remove)
    {
        tools_remove.addEventListener("click", function() {
            if(self.pixelManager)
            {
                self.pixelManager.removeFromDOM();
            }
        });
    }
}
PixelPerfect.prototype.isFirstRun = function()
{
    var firstRun = this.prefs.getBoolPref('extensions.firex-pixel.firstRun');
    if(firstRun)
    {
        this.prefs.setBoolPref('extensions.firex-pixel.firstRun', false);
        return true;
    }
    return false;
}
PixelPerfect.prototype.addIcon = function(toolbar, item)
{
    if(!document.getElementById(item))
    {
        var toolbarItem = document.getElementById(toolbar);
        toolbarItem.insertItem(item, null);
        toolbarItem.setAttribute("currentset", toolbarItem.currentSet);
        document.persist(toolbarItem.id, "currentset");

        if(toolbar == "addon-bar")
        {
            toolbarItem.collapsed = false;
        }
    }
}
PixelPerfect.prototype.filePicker = function()
{
    const nsIFilePicker = Components.interfaces.nsIFilePicker;
    var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    var self = this;

    filePicker.appendFilters(nsIFilePicker.filterImages);
    filePicker.init(window, "Dialog Title", nsIFilePicker.modeOpen);

    var uploadFile = filePicker.show();
    if(uploadFile == nsIFilePicker.returnOK)
    {
        var elNS = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "image");

        var layoutBox = document.getElementById("pixel-layout");
        if(layoutBox)
        {
            var localFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
            localFile.initWithPath(filePicker.file.path);
            if(localFile.exists())
            {
                while(layoutBox.firstChild)
                {
                    layoutBox.removeChild(layoutBox.firstChild);
                }

                var fileURI = this.ioService.newFileURI(localFile);
                elNS.setAttribute("src", fileURI.spec);

                var image = new Image();
                image.src = fileURI.spec;
                image.onload = function()
                {
                    const maxWidth = 290;
                    const maxHeight = 290;
                    var prop = this.width / this.height;
                    if(prop > 1.0)
                    {
                       this.width = maxWidth;
                       this.height = parseInt(this.width / prop);
                    }
                    else if(prop < 1.0)
                    {
                       this.height = maxHeight;
                       this.width = parseInt(this.height * prop);
                    }

                    elNS.setAttribute("height", this.height);
                    elNS.setAttribute("width", this.width);
                    layoutBox.appendChild(elNS);
                }

                this.localFile = filePicker.file;

                this.copyLayout();
            }
        }
    }
}
PixelPerfect.prototype.copyLayout = function()
{
    var dir = Components.classes["@mozilla.org/file/directory_service;1"]
        .getService(Components.interfaces.nsIProperties)
        .get("ProfD", Components.interfaces.nsIFile);

    var layoutsPath = ["extensions", "firex@pixel", "content", "layouts"];

    for(var i in layoutsPath)
    {
        dir.append(layoutsPath[i]);
    }

    var iDir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
    var iFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);

    iDir.initWithPath(dir.path);
    iFile.initWithPath(this.localFile.path);

    iFile.copyTo(iDir, null);

    try
    {
        var manage = new PixelManage();
        manage.addToDOM(this.localFile.leafName);

        this.pixelManager = manage;
    }
    catch(e)
    {
        Firebug.Console.log(e.stack);
    }
}

window.addEventListener("load", function() {
    var pixel = new PixelPerfect();
    pixel.onload();

    document.getElementById("upload-layout").addEventListener("click", function() {
        pixel.filePicker();
    });
});