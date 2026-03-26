export function annealing_forager(current, temperature) {
    let perturbation = (Math.random() * 2 - 1) * temperature;
    return current + perturbation;
}