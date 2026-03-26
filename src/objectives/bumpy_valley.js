import {smooth_valley} from "./smooth_valley.js";

export function bumpy_valley(x) {
    return smooth_valley(x) + Math.sin(x * 3);
}
