import * as strategies from "./strategies.js";
import * as functions from "./functions.js";
import {clear, plotCandidate, plotFunction, plotScore, setupCanvas} from "./plotting.js";

window.onload = main

function main() {
    let functionCanvas = setupCanvas("function", true);
    let scoreCanvas = setupCanvas("score", false);

    let x = [];
    for (let i = -10; i < 10; i += .1) {
        x.push(i);
    }

    let fn = functions.smooth_valley
    let guess = 5
    let scores = [fn(guess)]

    step(functionCanvas, scoreCanvas, x, guess, scores, fn, 50);
}

function step(functionCanvas, scoreCanvas, x, bestGuess, scores, fn, numSteps) {
    // implement our strategy
    // let candidate = strategies.nearby(bestGuess, 4)
    let candidate = strategies.anneal(bestGuess, 2.5, .01, scores.length / numSteps);
    // let candidate = strategies.random()

    // clamp so that we can always see it
    candidate = Math.max(Math.min(candidate, 10), -10)

    // update scores and best guess
    let possibleScore = fn(candidate);
    if (possibleScore < scores[scores.length - 1]) {
        scores.push(possibleScore);
        bestGuess = candidate;
    } else {
        scores.push(scores[scores.length - 1]);
    }

    // update plots
    clear(functionCanvas)
    clear(scoreCanvas)
    plotFunction(functionCanvas, x, x.map(fn));
    plotCandidate(functionCanvas, candidate, fn(candidate), '#7e9daa');
    plotCandidate(functionCanvas, bestGuess, fn(bestGuess), '#22b9ef');
    plotScore(scoreCanvas, scores, numSteps)
    if (scores.length < numSteps) {
        setTimeout(() => {
            requestAnimationFrame(() => step(functionCanvas, scoreCanvas, x, bestGuess, scores, fn, numSteps));
        }, 200)
    }
}
