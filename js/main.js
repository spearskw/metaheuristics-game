import {anneal, nearby} from "./strategies.js";
import {squiggles} from "./functions.js";
import {plotCandidate, plotFunction, plotScore, setupCanvas} from "./plotting.js";

window.onload = main

function main() {
    let truth = setupCanvas("truth", true);
    let search = setupCanvas("search", false);

    let x = [];
    for (let i = -10; i < 10; i += 0.1) {
        x.push(i);
    }

    let fn = squiggles
    let guess = 9.9
    let scores = [fn(guess)]

    requestAnimationFrame(() => step(truth, search, x, guess, scores, fn, 100));
}

function step(truth, search, x, bestGuess, scores, fn, numSteps) {

    // implement our strategy
    // let candidate = nearby(bestGuess, 0.2)
    let candidate = anneal(bestGuess, 1.5, .01, scores.length / 200);

    // update scores and best guess
    let possibleScore = fn(candidate);
    if (possibleScore < scores[scores.length - 1]) {
        scores.push(possibleScore);
        bestGuess = candidate;
    } else {
        scores.push(scores[scores.length - 1]);
    }

    // update plots
    let y = x.map(fn);
    plotFunction(truth, x, y);
    plotCandidate(truth, candidate, fn, '#7e9daa');
    plotCandidate(truth, bestGuess, fn, '#22b9ef');
    plotScore(search, scores, numSteps)
    if (scores.length < numSteps) {
        setTimeout(() => {
            requestAnimationFrame(() => step(truth, search, x, bestGuess, scores, fn, numSteps));
        }, 300)
    }
}
