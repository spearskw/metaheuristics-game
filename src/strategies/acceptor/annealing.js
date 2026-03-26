export function annealing_acceptor(old_score, new_score, temperature) {
    let delta = new_score - old_score;
    if (delta < 0) return true;
    return Math.random() < Math.exp(-delta / temperature);
}
