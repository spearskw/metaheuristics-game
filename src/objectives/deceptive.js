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
