import * as strategies from "./strategies.js";
import * as objectives from "./objectives.js";
import {clear, plotCandidate, plotObjective, plotScore, setupCanvas} from "./plotting.js";

window.onload = main

function main() {
    let config = {
        objective: objectives.deceptive,
        initialGuess: 7,
        numSteps: 100,
        millisBetweenFrames: 100,
        strategy: (val, progress) => strategies.anneal(val, 2.5, 0.1, progress)
        // strategy: (val, progress) => strategies.nearby(val, 0.4)
    }

    optimize(config)
}

function optimize(config) {
    let x = [];
    for (let i = -10; i < 10; i += .1) {
        x.push(i);
    }

    let scores = [config.objective(config.initialGuess)]

    setupCanvas("objective")
    setupCanvas("score")

    step(config, x, config.initialGuess, scores);
}

function step(config, x, bestGuess, scores) {
    let candidate = config.strategy(bestGuess, scores.length / config.numSteps);

    // clamp so that we can always see it
    candidate = Math.max(Math.min(candidate, 10), -10)

    // update scores and best guess
    let possibleScore = config.objective(candidate);
    if (possibleScore < scores[scores.length - 1]) {
        scores.push(possibleScore);
        bestGuess = candidate;
    } else {
        scores.push(scores[scores.length - 1]);
    }

    // update plots
    let objectiveCanvas = document.getElementById("objective");
    let scoreCanvas = document.getElementById("score");
    clear(objectiveCanvas)
    clear(scoreCanvas)
    plotObjective(objectiveCanvas, x, x.map(config.objective));
    plotCandidate(objectiveCanvas, candidate, config.objective(candidate), '#7e9daa');
    plotCandidate(objectiveCanvas, bestGuess, config.objective(bestGuess), '#22b9ef');
    plotScore(scoreCanvas, scores, config.numSteps)

    // iterate
    if (scores.length < config.numSteps) {
        setTimeout(() => {
            requestAnimationFrame(() => step(config, x, bestGuess, scores));
        }, config.millisBetweenFrames);
    }
}
