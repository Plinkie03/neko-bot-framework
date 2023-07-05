import { inspect } from "util";
import { Markdown, NekoArg, NekoCommand } from "../../index.js";

export default new NekoCommand()
    .setName("eval")
    .setDescription("Eval a js code")
    .defer(true)
    .setConditions(function(i) {
        return i.user.id === "1096285761365610576" ? true : {
            content: "You cant use this bro"
        };
    })
    .addArg(
        new NekoArg("code").required.string
            .setDescription("The code to eval")
    )
    .setHandle(async function(i, { code }) {
        let evaled;
        try {
            evaled = await eval(code);
        } catch (error: any) {
            evaled = error;
        }

        if (typeof evaled !== "string") evaled = inspect(evaled, { depth: 1 });

        await i.editReply(Markdown.codeBlock("js", `${evaled}`));

        return true;
    });
