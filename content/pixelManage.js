var PixelManage = function()
{
    this.imageObject = null;

    this.init();
}
PixelManage.prototype.init = function()
{
    if(this.imageObject)
    {
        this.imageObject = null;
        this.removeFromDOM();
    }

    var self = this;

    content.document.addEventListener("keypress", function(e) {
        var keyCode = e.keyCode || e.which;
        if(self.imageObject)
        {
            e.preventDefault();
            switch(keyCode)
            {
                case 1092:
                case 37:
                {
                    self.imageObject.style.left = parseInt(self.imageObject.style.left, 10) - 1 + "px";
                    break;
                }
                case 1094:
                case 38:
                {
                    self.imageObject.style.top = parseInt(self.imageObject.style.top, 10) - 1 + "px";
                    break;
                }
                case 1074:
                case 39:
                {
                    self.imageObject.style.left = parseInt(self.imageObject.style.left, 10) + 1 + "px";
                    break;
                }
                case 1099:
                case 40:
                {
                    self.imageObject.style.top = parseInt(self.imageObject.style.top, 10) + 1 + "px";
                    break;
                }
            }

            self.setInputCoords();
        }
    }, false);

    var opacityRange = document.getElementById("opacity-range");
    if(opacityRange)
    {
        opacityRange.addEventListener("change", function(e) {
            if(self.imageObject)
            {
                self.imageObject.style.opacity = e.target.valueAsNumber >= 10 ? 1.0 : "0." + e.target.valueAsNumber;
            }
        });
    }

    var coord_box = document.getElementsByClassName("coord-box");
    if(coord_box)
    {
        for(var i = 0; i < coord_box.length; i++)
        {
            coord_box[i].addEventListener("input", function(e) {
                switch(this.id)
                {
                    case "coord-x":
                    {
                        self.imageObject.style.left = e.originalTarget.value + "px";
                        break;
                    }
                    case "coord-y":
                    {
                        self.imageObject.style.top = e.originalTarget.value + "px";
                        break;
                    }
                }
            });
        }
    }     
}
PixelManage.prototype.removeFromDOM = function()
{
    this.imageObject = null;

    var image = content.document.getElementById("pixel-image");
    if(image)
    {
        content.document.body.removeChild(image);
    }
}
PixelManage.prototype.addToDOM = function(name)
{
    if(!this.imageObject)
    {
        content.window.scrollTo(0, 0);

        var pixelWrap = content.document.createElement("div");
        pixelWrap.setAttribute("style", "position: absolute; z-index: 999999; top: 0; left: 0; -moz-user-select: none; cursor: move;");
        pixelWrap.setAttribute("id", "pixel-image");
        content.document.body.appendChild(pixelWrap);

        var imageObject = content.document.createElement("img");
        imageObject.src = "chrome://FireX-Pixel/content/layouts/" + name;
        imageObject.setAttribute("draggable", false);
        imageObject.setAttribute("style", "pointer-events: none;");
        pixelWrap.appendChild(imageObject);

        this.imageObject = pixelWrap;

        var self = this;

        this.imageObject.addEventListener("mousedown", function(e) {
            this.setAttribute("class", "mousedown");
            this.shiftX = this.clientWidth - parseInt(this.style.left, 10) - (this.clientWidth - e.pageX);
            this.shiftY = this.clientHeight - parseInt(this.style.top, 10) - (this.clientHeight - e.pageY);
        }, false);

        content.document.addEventListener("mouseup", function() {
            if(self.imageObject.className == "mousedown")
            {
                self.imageObject.className = "";
            }
        });

        content.document.addEventListener("mousemove", function(e) {
            if(self.imageObject)
            {
                if(self.imageObject.className == "mousedown")
                {
                    self.imageObject.style.left = e.pageX - self.imageObject.shiftX + "px";
                    self.imageObject.style.top = e.pageY - self.imageObject.shiftY + "px";

                    self.setInputCoords();
                }
            }
        });

        this.addMenuToDOM(pixelWrap);
    }
}
PixelManage.prototype.addMenuToDOM = function(wrap)
{
    var menuWrapper = content.document.createElement("div");
    menuWrapper.setAttribute("style", "position: absolute; top: 0; right: 0;");
    wrap.appendChild(menuWrapper);

    var tools = [
        { id: 'tool_remove', img: 'chrome://FireX-Pixel/skin/tools/delete.png' }
    ];

    var self = this;

    for(var i in tools)
    {
        var currentTool = content.document.createElement("img");
        currentTool.setAttribute("src", tools[i].img);
        currentTool.setAttribute("id", tools[i].id);
        currentTool.setAttribute("style", "cursor: pointer;")
        menuWrapper.appendChild(currentTool);

        currentTool.addEventListener("click", function() {
            switch(tools[i].id)
            {
                case 'tool_remove':
                {
                    self.removeFromDOM();
                    break;
                }
            }
        });
    }
}
PixelManage.prototype.setInputCoords = function()
{
    document.getElementById("coord-x").value = parseInt(this.imageObject.style.left, 10);
    document.getElementById("coord-y").value = parseInt(this.imageObject.style.top, 10);
}
PixelManage.prototype.toggleTransparence = function()
{
    var image = content.document.getElementById("pixel-image");
    if(!image.style.pointerEvents)
    {
        image.style.pointerEvents = 'none';
    }
    else
    {
        image.style.pointerEvents = '';
    }
}