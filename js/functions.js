export function line(x) {
    return x;
}

export function square(x) {
    return x * x;
}

export function squiggles(x) {
    return ((x+5) * (x+5)) / 20 + Math.sin(x * 3) - 2;
}

export function needle(x) {
    if (-1 < x && x < 1) {
        return 0
    }
    return 3
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