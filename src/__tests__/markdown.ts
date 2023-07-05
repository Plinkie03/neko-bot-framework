import { Markdown } from "../classes/Markdown.js";

console.log(
    Markdown.list([
        "cope",
        "yes",
        [
            "cope",
            [
                "cope"
            ],
            "bro"
        ],
        "bro"
    ]).join("\n")
);
