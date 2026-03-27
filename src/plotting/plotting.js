export function setupCanvas(id) {
    let canvas = document.getElementById(id);

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    return canvas;
}

export function plotCandidate(canvas, x, y, color) {
    plotMarker(canvas, x, y, -10, 10, -10, 10, color);
}

export function plotObjective(canvas, x, y) {
    plot(canvas, x, y, -10, 10, -10, 10);
}

export function clear(canvas) {
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function plotScore(canvas, scores, numSteps, goalY) {
    let x = []
    for (let i = 0; i < numSteps; i++) {
        x.push(i);
    }
    plot(canvas, x, scores, 0, numSteps - 1, -10, 10);

    if (goalY !== undefined) {
        let ctx = canvas.getContext('2d');
        let v = scaleY(goalY, -10, 10, canvas.height);
        ctx.strokeStyle = '#e31f1f';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(0, v);
        ctx.lineTo(canvas.width, v);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function plot(canvas, x, y, xmin, xmax, ymin, ymax) {
    let ctx = canvas.getContext('2d');

    let u = x.map(it => scaleX(it, xmin, xmax, canvas.width))
    let v = y.map(it => scaleY(it, ymin, ymax, canvas.height))

    ctx.beginPath();
    ctx.strokeStyle = '#88d68a';
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
    let clamped = Math.max(ymin, Math.min(ymax, val));
    return (ymax - clamped) / (ymax - ymin) * height;
}

export function findMinimum(xValues, yValues) {
    let minIndex = 0;
    for (let i = 1; i < yValues.length; i++) {
        if (yValues[i] < yValues[minIndex]) {
            minIndex = i;
        }
    }
    return { x: xValues[minIndex], y: yValues[minIndex] };
}

export function plotFlag(canvas, x, y) {
    let ctx = canvas.getContext('2d');
    let u = scaleX(x, -10, 10, canvas.width);
    let v = scaleY(y, -10, 10, canvas.height);

    // Pole
    ctx.strokeStyle = '#4a3728';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(u, v);
    ctx.lineTo(u, v - 28);
    ctx.stroke();

    // Pennant
    ctx.fillStyle = '#e31f1f';
    ctx.beginPath();
    ctx.moveTo(u, v - 28);
    ctx.lineTo(u + 12, v - 22);
    ctx.lineTo(u, v - 16);
    ctx.closePath();
    ctx.fill();
}

export function plotTent(canvas, x, y) {
    let ctx = canvas.getContext('2d');
    let u = scaleX(x, -10, 10, canvas.width);
    let v = scaleY(y, -10, 10, canvas.height);

    // Body
    ctx.fillStyle = '#22b9ef';
    ctx.beginPath();
    ctx.moveTo(u - 10, v);
    ctx.lineTo(u + 10, v);
    ctx.lineTo(u, v - 22);
    ctx.closePath();
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#1a6e8f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(u - 10, v);
    ctx.lineTo(u + 10, v);
    ctx.lineTo(u, v - 22);
    ctx.closePath();
    ctx.stroke();

    // Door
    ctx.fillStyle = '#1a8ab5';
    ctx.beginPath();
    ctx.moveTo(u - 4, v);
    ctx.lineTo(u + 4, v);
    ctx.lineTo(u, v - 10);
    ctx.closePath();
    ctx.fill();
}

export function plotPerson(canvas, x, y) {
    let ctx = canvas.getContext('2d');
    let u = scaleX(x, -10, 10, canvas.width);
    let v = scaleY(y, -10, 10, canvas.height);

    ctx.fillStyle = '#7e9daa';
    ctx.strokeStyle = '#7e9daa';
    ctx.lineWidth = 2;

    // Head
    ctx.beginPath();
    ctx.arc(u, v - 22, 4, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.moveTo(u, v - 18);
    ctx.lineTo(u, v - 10);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(u - 6, v - 15);
    ctx.lineTo(u + 6, v - 15);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(u, v - 10);
    ctx.lineTo(u - 5, v);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(u, v - 10);
    ctx.lineTo(u + 5, v);
    ctx.stroke();
}
