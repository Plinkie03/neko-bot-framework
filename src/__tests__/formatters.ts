import { Formatters } from "../classes/Formatters.js";

Formatters.setOptions({
    notation: "compact",
    maximumFractionDigits: 2
});

console.log(
    Formatters.number(1000),
    Formatters.number(1241)
);
