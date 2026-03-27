import {always_accept_if_better} from "../../strategies/acceptor/always_if_better.js";
import {hillClimb} from "../../strategies/forager/hill-climb.js";
import {clear, plotFlag, plotTent, plotPerson, findMinimum, plotObjective, plotScore, setupCanvas} from "../../plotting/plotting.js";
import {bumpy_valley} from "../../objectives/bumpy_valley.js";

window.onload = main;

function main() {
    document.getElementById("strategy-help").addEventListener("click", () => {
        document.getElementById("strategy-overlay").classList.add("visible");
    });
    document.getElementById("strategy-ok").addEventListener("click", () => {
        document.getElementById("strategy-overlay").classList.remove("visible");
    });

    let config = {
        objective: bumpy_valley,
        initialGuess: 9,
        numSteps: 20,
        millisBetweenFrames: 200,
        strategy: {
            acceptor: always_accept_if_better
        }
    }

    const form = document.getElementById("form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        config.strategy.forager = hillClimb;
        config.stepSize = e.target.stepSize.value;

        document.getElementById("startButton").disabled = true;
        document.getElementById("stepSize").disabled = true;
        document.getElementById("strategy").disabled = true;

        optimize(config);
    })

    const nextLevelButton = document.getElementById("nextLevelButton");
    nextLevelButton.addEventListener("click", () => {
        window.location.href = "../level_03/index.html"
    })

    const tryAgainButton = document.getElementById("tryAgainButton");
    tryAgainButton.addEventListener("click", () => {
        const objectiveCanvas = document.getElementById("objective");
        const scoreCanvas = document.getElementById("score");
        clear(objectiveCanvas)
        clear(scoreCanvas)
        document.getElementById("startButton").disabled = false;
        document.getElementById("strategy").disabled = false;
        document.getElementById("stepSize").disabled = false;
        hideModal();
    })
}

function optimize(config) {
    let x = [];
    for (let i = -10; i < 10; i += .1) {
        x.push(i);
    }

    let scores = [config.objective(config.initialGuess)]

    setupCanvas("objective");
    setupCanvas("score");

    step(config, x, config.initialGuess, scores);
}

function step(config, x, bestGuess, scores) {
    let candidate = config.strategy.forager(bestGuess, config.stepSize);
    // let candidate = config.strategy(bestGuess, scores.length / config.numSteps);


    // update scores and best guess
    let possibleScore = config.objective(candidate);
    if (config.strategy.acceptor(config.objective(bestGuess), possibleScore)) {
        scores.push(possibleScore);
        bestGuess = candidate;
    } else {
        scores.push(scores[scores.length - 1]);
    }

    // update plots
    let objectiveCanvas = document.getElementById("objective");
    let scoreCanvas = document.getElementById("score");
    clear(objectiveCanvas);
    clear(scoreCanvas);
    let yValues = x.map(config.objective);
    plotObjective(objectiveCanvas, x, yValues);
    let min = findMinimum(x, yValues);
    plotFlag(objectiveCanvas, min.x, min.y);
    plotPerson(objectiveCanvas, candidate, config.objective(candidate));
    plotTent(objectiveCanvas, bestGuess, config.objective(bestGuess));
    plotScore(scoreCanvas, scores, config.numSteps, min.y);

    // iterate
    if (scores.length < config.numSteps) {
        setTimeout(() => {
            requestAnimationFrame(() => step(config, x, bestGuess, scores));
        }, config.millisBetweenFrames);
    } else {
        let bestScore = config.objective(bestGuess);
        let yValues = x.map(config.objective);
        let goal = findMinimum(x, yValues).y;
        showModal(Math.abs(bestScore - goal) < 0.05);
    }
}

function showModal(reached) {
    const result = document.getElementById("modal-result");
    result.textContent = reached ? "You reached the objective!" : "You didn't reach the objective.";
    result.className = reached ? "success" : "failure";
    document.getElementById("modal").style.display = "flex";
}

function hideModal() {
    document.getElementById("modal").style.display = "none";
}
