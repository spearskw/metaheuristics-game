export function line(x) {
    return x;
}

export function parabola(x) {
    return x * x;
}

export function bumpy_valley(x) {
    return smooth_valley(x) + Math.sin(x * 3);
}

export function needle_in_haystack(x) {
    if (-.2 < x && x < .2) {
        return -1
    }
    return 1
}

export function deceptive(x) {
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

export function smooth_valley(x) {
    return (x+5)*(x+5) / 20 - 2
}