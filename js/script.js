function drawSelectionIcons() {
    // Rectangle
    let rectCanvas = $("#rectangle0")[0];
    let rectCtx = rectCanvas.getContext("2d");
    rectCanvas.width = 200;
    rectCanvas.height = 100;

    rectCtx.strokeStyle = "black";
    rectCtx.lineWidth = 2;
    rectCtx.strokeRect(20, 20, 160, 60);

    // Cercle
    let circleCanvas = $("#circle0")[0];
    let circleCtx = circleCanvas.getContext("2d");
    circleCanvas.width = 200;
    circleCanvas.height = 100;

    circleCtx.beginPath();
    circleCtx.arc(100, 50, 30, 0, Math.PI * 2);
    circleCtx.strokeStyle = "black";
    circleCtx.lineWidth = 2;
    circleCtx.stroke();

    // Triangle
    let triangleCanvas = $("#triangle0")[0];
    let triangleCtx = triangleCanvas.getContext("2d");
    triangleCanvas.width = 200;
    triangleCanvas.height = 100;

    triangleCtx.beginPath();
    triangleCtx.moveTo(100, 20);
    triangleCtx.lineTo(30, 80);
    triangleCtx.lineTo(170, 80);
    triangleCtx.closePath();
    triangleCtx.strokeStyle = "black";
    triangleCtx.lineWidth = 2;
    triangleCtx.stroke();
}

drawSelectionIcons();

let selectedShape = "rectangle";
let currentColor = $("input[type='color']").val();
let shapes = []; // 🔥 stockage des formes

$("input[type='color']").on("input", function() {
    currentColor = $(this).val();
});

$(".shape").click(function() {
    let id = $(this).attr("id");
    if (id.includes("rectangle")) selectedShape = "rectangle";
    else if (id.includes("circle")) selectedShape = "circle";
    else if (id.includes("triangle")) selectedShape = "triangle";
});

let canvas = $("#mainCanvas")[0];
let ctx = canvas.getContext("2d");
let drawing = false;
let startX = 0, startY = 0;

// 🔁 Redessine toutes les formes
function redrawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(shape => drawShape(shape));
}

// ✏️ Dessine UNE forme
function drawShape(shape) {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = 2;

    if (shape.type === "rectangle") {
        ctx.strokeRect(
            Math.min(shape.x1, shape.x2),
            Math.min(shape.y1, shape.y2),
            Math.abs(shape.x2 - shape.x1),
            Math.abs(shape.y2 - shape.y1)
        );
    } 
    else if (shape.type === "circle") {
        let r = Math.hypot(shape.x2 - shape.x1, shape.y2 - shape.y1);
        ctx.beginPath();
        ctx.arc(shape.x1, shape.y1, r, 0, Math.PI * 2);
        ctx.stroke();
    } 
    else if (shape.type === "triangle") {
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.lineTo(shape.x1 * 2 - shape.x2, shape.y2);
        ctx.closePath();
        ctx.stroke();
    }
}


let mode = "draw"; // "draw" ou "move"

$("#ChangeMode").click(function() {
    mode = (mode === "draw") ? "move" : "draw";
    $(this).text(mode === "draw" ? "Mode édition" : "Mode déplacement");
});

function isPointInShape(x, y, shape) {
    if (shape.type === "rectangle") {
        let minX = Math.min(shape.x1, shape.x2);
        let maxX = Math.max(shape.x1, shape.x2);
        let minY = Math.min(shape.y1, shape.y2);
        let maxY = Math.max(shape.y1, shape.y2);
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    }

    if (shape.type === "circle") {
        let r = Math.hypot(shape.x2 - shape.x1, shape.y2 - shape.y1);
        let d = Math.hypot(x - shape.x1, y - shape.y1);
        return d <= r;
    }

    if (shape.type === "triangle") {
        // simple approximation : bounding box
        let minX = Math.min(shape.x1, shape.x2, shape.x1 * 2 - shape.x2);
        let maxX = Math.max(shape.x1, shape.x2, shape.x1 * 2 - shape.x2);
        let minY = Math.min(shape.y1, shape.y2);
        let maxY = Math.max(shape.y1, shape.y2);
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    }
}

let selectedShapeIndex = null;
let offsetX = 0, offsetY = 0;

$(canvas).mousedown(function(e) {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    if (mode === "draw") {
        drawing = true;
        startX = x;
        startY = y;
    }

    if (mode === "move") {
        for (let i = shapes.length - 1; i >= 0; i--) {
            if (isPointInShape(x, y, shapes[i])) {
                selectedShapeIndex = i;
                offsetX = x - shapes[i].x1;
                offsetY = y - shapes[i].y1;
                break;
            }
        }
    }
});



// Suivre la souris
$(canvas).mousemove(function(e) {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    if (mode === "draw" && drawing) {
        redrawAll();
        drawShape({
            type: selectedShape,
            x1: startX,
            y1: startY,
            x2: x,
            y2: y,
            color: currentColor
        });
    }

    if (mode === "move" && selectedShapeIndex !== null) {
        let s = shapes[selectedShapeIndex];
        let dx = x - offsetX - s.x1;
        let dy = y - offsetY - s.y1;

        s.x1 += dx;
        s.y1 += dy;
        s.x2 += dx;
        s.y2 += dy;

        redrawAll();
    }
});


let shapeId = 0; // compteur global

$(canvas).mouseup(function(e) {

    // Fin du dessin
    if (mode === "draw" && drawing) {
        drawing = false;

        let rect = canvas.getBoundingClientRect();
        let endX = e.clientX - rect.left;
        let endY = e.clientY - rect.top;

        shapes.push({
            id: shapeId++,
            type: selectedShape,
            x1: startX,
            y1: startY,
            x2: endX,
            y2: endY,
            color: currentColor
        });
    }

    // Fin du déplacement
    if (mode === "move") {
        selectedShapeIndex = null;
    }
});



// Sortie de la souris
$(canvas).mouseleave(function() {
    drawing = false;
});
 

