window.onload = main

function main() {
    const canvas = document.getElementById('function');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let x = [];
    for (let i = -10; i< 10; i+= 0.1) {
        x.push(i);
    }
    let y = x.map(squiggles)

    plotFunction(ctx, canvas, x, y);
    let candidate = Math.random() * 20 - 10;
    console.log(candidate);
    plotCandidate(ctx, canvas, candidate, squiggles);
}

function plotCandidate(ctx, canvas, x, fn) {
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

function plotFunction(ctx, canvas, x, y) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // put the origin at the center
    ctx.translate(canvas.width / 2, canvas.height / 2);
    // positive y is in the up direction
    ctx.scale(1, -1);

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
    return (-x*x)/20 + 1.5*Math.sin(x*1.4) + 2;
}
