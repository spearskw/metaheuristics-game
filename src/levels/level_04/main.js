import {clear, plotCandidate, plotObjective, plotScore, setupCanvas} from "../../plotting/plotting.js";
import {make_random_guess} from "../../strategies/forager/random.js";
import {annealing_forager} from "../../strategies/forager/annealing.js";
import {always_accept_if_better} from "../../strategies/acceptor/always_if_better.js";
import {annealing_acceptor} from "../../strategies/acceptor/annealing.js";
import {smooth_valley} from "../../objectives/smooth_valley.js";
import {bumpy_valley} from "../../objectives/bumpy_valley.js";
import {deceptive} from "../../objectives/deceptive.js";
import {needle_in_haystack} from "../../objectives/needle_in_haystack.js";

const objectives = {
    smooth_valley,
    bumpy_valley,
    deceptive,
    needle_in_haystack
};

let running = false;
let timerId = null;

window.onload = main

function main() {
    let config = {
        objective: smooth_valley,
        initialGuess: 7,
        numSteps: 100,
        millisBetweenFrames: 100,
        strategy: {
            forager: annealing_forager,
            acceptor:annealing_acceptor
        }
    }

    setupCanvas("objective")
    setupCanvas("score")

    document.getElementById("initial").addEventListener("input", (e) => {
        document.getElementById("initial-value").textContent = e.target.value;
    });
    document.getElementById("iterations").addEventListener("input", (e) => {
        document.getElementById("iterations-value").textContent = e.target.value;
    });
    document.getElementById("temperature").addEventListener("input", (e) => {
        document.getElementById("temperature-value").textContent = e.target.value;
    });
    document.getElementById("speed").addEventListener("input", (e) => {
        document.getElementById("speed-value").textContent = e.target.value;
    });

    let btn = document.getElementById("start");
    btn.addEventListener("click", () => {
        if (running) {
            running = false;
            clearTimeout(timerId);
            btn.textContent = "Start";
        } else {
            running = true;
            btn.textContent = "Stop";
            config.objective = objectives[document.getElementById("objective-fn").value];
            config.initialGuess = parseFloat(document.getElementById("initial").value);
            config.numSteps = parseInt(document.getElementById("iterations").value);
            optimize(config);
        }
    });
}

function optimize(config) {
    let x = [];
    for (let i = -10; i < 10; i += .1) {
        x.push(i);
    }

    let scores = [config.objective(config.initialGuess)]

    step(config, x, config.initialGuess, config.initialGuess, scores);
}

function step(config, x, current, bestGuess, scores) {
    let maxTemp = parseInt(document.getElementById("temperature").value);
    document.getElementById("temperature-value").textContent = maxTemp;
    let temperature = maxTemp * (1 - scores.length / config.numSteps);
    let candidate = config.strategy.forager(current, temperature)
    // let candidate = config.strategy(bestGuess, scores.length / config.numSteps);

    // clamp so that we can always see it
    candidate = Math.max(Math.min(candidate, 10), -10)

    // update current solution and best guess
    let possibleScore = config.objective(candidate);
    if (config.strategy.acceptor(config.objective(current), possibleScore, temperature)) {
        current = candidate;
        if (possibleScore < config.objective(bestGuess)) {
            bestGuess = current;
        }
    }
    scores.push(config.objective(current));

    document.getElementById("best-value").textContent = bestGuess.toFixed(4);
    document.getElementById("current-value").textContent = current.toFixed(4);
    document.getElementById("iteration-value").textContent = scores.length + " / " + config.numSteps;

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
    if (scores.length < config.numSteps && running) {
        let slider = document.getElementById("speed");
        let delay = parseInt(slider.value);
        document.getElementById("speed-value").textContent = delay;
        timerId = setTimeout(() => {
            requestAnimationFrame(() => step(config, x, current, bestGuess, scores));
        }, delay);
    } else {
        running = false;
        document.getElementById("start").textContent = "Start";
    }
}
