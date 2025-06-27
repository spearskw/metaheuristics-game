window.onload = main

function main() {
    let truth = setupCanvas("truth");
    let search = setupCanvas("search");

    let x = [];
    for (let i = -10; i < 10; i += 0.1) {
        x.push(i);
    }

    let fn = squiggles

    var guess = 9.9
    let scores = [fn(guess)]
    requestAnimationFrame(() => step(truth, search, x, guess, scores, fn));
}

function step(truth, search, x, bestGuess, scores, fn) {
    let y = x.map(fn);
    plotFunction(truth, x, y);

    // let candidate = nearby(bestGuess, 0.2)
    let candidate = anneal(bestGuess, 2.5, 0.01, scores.length / 200);
    let possibleScore = fn(candidate);
    if (possibleScore < scores[scores.length - 1]) {
        scores.push(possibleScore);
        bestGuess = candidate;
    } else {
        scores.push(scores[scores.length - 1]);
    }
    plotCandidate(truth, candidate, fn);
    plotFunction(search, x, scores)
    if (scores.length < 200) {
        setTimeout(() => {
            requestAnimationFrame(() => step(truth, search, x, bestGuess, scores, fn))
        }, 100)
    }
}

// heuristics
function random() {
    return Math.random() * 20 - 10;
}

function nearby(base, stepSize) {
    return base + Math.random() * stepSize * 2 - stepSize;
}

function anneal(base, bigStep, smallStep, progress) {
    let stepSize = bigStep + (smallStep - bigStep) * progress
    return base + Math.random() * stepSize * 2 - stepSize
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
    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

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

// sample functions
function line(x) {
    return x;
}

function square(x) {
    return x * x;
}

function squiggles(x) {
    return ((x+5) * (x+5)) / 20 + 1.5 * Math.sin(x * 1.4) - 2;
}

function needle(x) {
    if (-1 < x && x < 1) {
        return 0
    }
    return 3
}

function deceptive(x) {
    if (x < -9) {
        return 0
    }
    if (x < 9) {
        return x / 2
    }
    if (x >= 9) {
        return -8
    }

}
