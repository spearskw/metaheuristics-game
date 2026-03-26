import {smooth_valley} from "../levels/level_01/objectives.js";

export function bumpy_valley(x) {
    return smooth_valley(x) + Math.sin(x * 3);
}
