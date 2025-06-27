window.onload = main

function main() {
    let truth = setupCanvas("truth");
    let search = setupCanvas("search");

    let x = [];
    for (let i = -10; i< 10; i+= 0.1) {
        x.push(i);
    }
    let y = x.map(squiggles)

    plotFunction(truth, x, y);
    let candidate = Math.random() * 20 - 10;
    console.log(candidate);
    plotCandidate(truth, candidate, squiggles);
    plotCandidate(search, candidate, squiggles);
}

function setupCanvas(id) {
    let canvas = document.getElementById(id);
    let ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // put the origin at the center
    ctx.translate(canvas.width / 2, canvas.height / 2);
    // positive y is in the up direction
    ctx.scale(1, -1);

    return canvas;
}

function plotCandidate(canvas, x, fn) {
    let ctx = canvas.getContext('2d');
    let u = x * canvas.width / 20;
    let v = fn(x) * canvas.height / 20;

    ctx.strokeStyle = '#1f6b91';
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

function plotFunction(canvas, x, y) {
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // scale to -10..10
    let u = x.map(it => it * canvas.width / 20);
    let v = y.map(it => it * canvas.height / 20);

    ctx.beginPath();
    ctx.strokeStyle = '#e31f1f';
    ctx.lineWidth = 2;

    for (let i = 0; i < x.length - 1; i++) {
        ctx.moveTo(u[i], v[i]);
        ctx.lineTo(u[i+1], v[i+1]);
        ctx.stroke();
    }
    ctx.closePath();
}

function line(x) {
    return x;
}

function square(x) {
    return x*x;
}

function squiggles(x) {
    return (x*x)/15 + 1.5*Math.sin(x*1.4) - 2;
}
