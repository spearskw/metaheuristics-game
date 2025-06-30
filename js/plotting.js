export function setupCanvas(id) {
    let canvas = document.getElementById(id);

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    return canvas;
}

export function plotCandidate(canvas, x, y, color) {
    plotMarker(canvas, x, y, -10, 10, -10, 10, color);
}

export function plotFunction(canvas, x, y) {
    plot(canvas, x, y, -10, 10, -10, 10);
}

export function clear(canvas) {
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function plotScore(canvas, scores, numSteps) {
    let x = []
    for (let i = 0; i < numSteps; i++) {
        x.push(i);
    }
    plot(canvas, x, scores, 0, numSteps - 1, -10, 10);
}

export function plot(canvas, x, y, xmin, xmax, ymin, ymax) {
    let ctx = canvas.getContext('2d');

    let u = x.map(it => scaleX(it, xmin, xmax, canvas.width))
    let v = y.map(it => scaleY(it, ymin, ymax, canvas.height))

    ctx.beginPath();
    ctx.strokeStyle = '#e31f1f';
    ctx.lineWidth = 2;

    for (let i = 0; i < x.length - 1; i++) {
        ctx.moveTo(u[i], v[i]);
        ctx.lineTo(u[i + 1], v[i + 1]);
        ctx.stroke();
    }
    ctx.closePath();
}

function plotMarker(canvas, x, y, xmin, xmax, ymin, ymax, color) {
    let ctx = canvas.getContext('2d');
    let u = scaleX(x, xmin, xmax, canvas.width)
    let v = scaleY(y, ymin, ymax, canvas.height)

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;

    // draw an X
    ctx.beginPath();
    ctx.moveTo(u + 10, v + 10);
    ctx.lineTo(u - 10, v - 10);
    ctx.stroke();
    ctx.moveTo(u + 10, v - 10);
    ctx.lineTo(u - 10, v + 10);
    ctx.stroke()
    ctx.closePath();
}

// xmin -> 0
// xmax -> width
function scaleX(val, xmin, xmax, width) {
    return (val - xmin) / (xmax - xmin) * width;
}

// y axis is inverted
// ymin -> height
// ymax -> 0
function scaleY(val, ymin, ymax, height) {
    return (ymax - val) / (ymax - ymin) * height;
}
