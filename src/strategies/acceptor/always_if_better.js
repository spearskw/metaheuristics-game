export function always_accept_if_better(old_score, new_score) {
    return new_score <= old_score;
}
