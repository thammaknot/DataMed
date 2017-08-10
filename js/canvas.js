var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var penColors = new Array();
var penSizes = new Array();
var curCanvasWidth = 0;
var curCanvasHeight = 0;
var paint;
var popupCanvasWidth = 500;
var popupCanvasHeight = 500;
var thumbnailCanvasWidth = 250;
var thumbnailCanvasHeight = 250;
var penColor = '#0033FF';
var penSize = 3;

var setupCanvas = function(canvas, url, currentDrawing, width, height, drawable) {
    var context = canvas[0].getContext('2d');
    canvas[0].width = width;
    canvas[0].height = height;
    if (currentDrawing && currentDrawing.clickX && currentDrawing.clickX.length > 0) {
        newClickX = unnormalizeDrawingCoordinates(currentDrawing.clickX, width);
        newClickY = unnormalizeDrawingCoordinates(currentDrawing.clickY, height);
        clickX = newClickX;
        clickY = newClickY;
        clickDrag = currentDrawing.clickDrag;
        penColors = currentDrawing.penColors;
        penSizes = currentDrawing.penSizes;
    } else {
        clickX = new Array();
        clickY = new Array();
        clickDrag = new Array();
        penColors = new Array();
        penSizes = new Array();
    }
    curCanvasWidth = width;
    curCanvasHeight = height;

    var bgImage = new Image();
    bgImage.src = url;
    bgImage.onload = function(cx, cy, cd, pc, ps) {
        return function() {
            var drawing = {
                clickX: cx,
                clickY: cy,
                clickDrag: cd,
                penColors: pc,
                penSizes: ps,
            };
            redraw(context, bgImage, drawing);
        };
    }(clickX, clickY, clickDrag, penColors, penSizes);


    if (drawable) {
        canvas.mousedown(function(e) {
            var box = this.getBoundingClientRect();
            var mouseX = e.clientX - box.left;
            var mouseY = e.clientY - box.top;

            paint = true;
            addClick(mouseX, mouseY, false);
            var drawing = {
                clickX: clickX,
                clickY: clickY,
                clickDrag: clickDrag,
                penColors: penColors,
                penSizes: penSizes,
            };
            redraw(context, bgImage, drawing);
        });

        canvas.mousemove(function(e) {
            if (paint) {
                var box = this.getBoundingClientRect();
                var mouseX = e.clientX - box.left;
                var mouseY = e.clientY - box.top;
                addClick(mouseX, mouseY, true);
                var drawing = {
                    clickX: clickX,
                    clickY: clickY,
                    clickDrag: clickDrag,
                    penColors: penColors,
                    penSizes: penSizes,
                };
                redraw(context, bgImage, drawing);
            }
        });

        canvas.mouseup(function(e){
            paint = false;
        });

        canvas.mouseleave(function(e){
            paint = false;
        });
    }
};

var addClick = function(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging );
    penColors.push(penColor);
    penSizes.push(penSize);
};

var redraw = function(context, bgImage, drawing) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    context.drawImage(bgImage, 0, 0, curCanvasWidth, curCanvasHeight);

    context.strokeStyle = penColor;
    context.lineJoin = "round";
    context.lineWidth = penSize;

    var clickX = drawing.clickX;
    var clickY = drawing.clickY;
    var clickDrag = drawing.clickDrag;
    for (var i = 0; i < clickX.length; i++) {
        context.beginPath();
        if (clickDrag[i] && i) {
            context.moveTo(clickX[i-1], clickY[i-1]);
        } else {
            context.moveTo(clickX[i] - 1, clickY[i]);
        }
        context.lineTo(clickX[i], clickY[i]);
        context.closePath();
        context.stroke();
    }
};

var getCurrentDrawing = function() {
    var drawingObject = {};
    // Normalize x,y coordinates into fraction in [0, 1] relative to
    // canvas size.
    for (var i = 0; i < clickX.length; ++i) {
        clickX[i] = clickX[i] / curCanvasWidth;
        clickY[i] = clickY[i] / curCanvasHeight;
    }
    drawingObject.clickX = clickX;
    drawingObject.clickY = clickY;
    drawingObject.clickDrag = clickDrag;
    drawingObject.penColors = penColors;
    drawingObject.penSizes = penSizes;
    return drawingObject;
};

var unnormalizeDrawingCoordinates = function(clickArray, newSize) {
    var output = [];
    for (var i = 0; i < clickArray.length; ++i) {
        output[i] = clickArray[i] * newSize;
    }
    return output;
};

var getImageInfo = function() {
    var output = {};
    for (var i = 0; i < imageInfo.length; ++i) {
        output[i] = imageInfo[i];
    }
    return output;
};
