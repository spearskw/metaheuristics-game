export function setupCanvas(id, isOriginCenter) {
    let canvas = document.getElementById(id);
    let ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // put the origin at the center
    if (isOriginCenter) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
    } else {
        ctx.translate(0, canvas.height / 2);
    }
    // positive y is in the up direction
    ctx.scale(1, -1);

    return canvas;
}

export function plotCandidate(canvas, x, fn, color) {
    let ctx = canvas.getContext('2d');
    let u = x * canvas.width / 20;
    let v = fn(x) * canvas.height / 20;

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(u + 10, v + 10);
    ctx.lineTo(u - 10, v - 10);
    ctx.stroke();
    ctx.moveTo(u + 10, v - 10);
    ctx.lineTo(u - 10, v + 10);
    ctx.stroke()
    ctx.closePath();
}

export function clearFunction(canvas) {
    let ctx = canvas.getContext('2d');
    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
}

export function plotFunction(canvas, x, y) {
    let ctx = canvas.getContext('2d');

    // scale to -10..10
    let u = x.map(it => it * canvas.width / 20);
    let v = y.map(it => it * canvas.height / 20);

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

export function clearScore(canvas) {
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function plotScore(canvas, scores, numSteps) {
    let ctx = canvas.getContext('2d');
    // scale to 0..numSteps for x and -10..10 for y
    let u = []
    for (let i = 0; i < numSteps; i++) {
        u.push(i * canvas.width / numSteps);
    }
    let v = scores.map(it => it * canvas.height / 20);

    ctx.beginPath();
    ctx.strokeStyle = '#e31f1f';
    ctx.lineWidth = 2;

    for (let i = 0; i < u.length - 1; i++) {
        ctx.moveTo(u[i], v[i]);
        ctx.lineTo(u[i + 1], v[i + 1]);
        ctx.stroke();
    }
    ctx.closePath();
}