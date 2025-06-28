export function random() {
    return Math.random() * 20 - 10;
}

export function nearby(base, stepSize) {
    return base + Math.random() * stepSize * 2 - stepSize;
}

export function anneal(base, bigStep, smallStep, progress) {
    let stepSize = bigStep + (smallStep - bigStep) * progress
    return base + Math.random() * stepSize * 2 - stepSize
}