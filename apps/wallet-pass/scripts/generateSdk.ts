import {Application} from "../src/_core/application";
import {env} from "../src/env";
import {controllers, securityRules} from "../src/controllers";
import * as fs from "fs/promises";

class SpecDownload {

    async download(){

        const app = new Application()
            .controllers(controllers)
            .securityRules(securityRules);

        const port = 8085;

        await app.start(8085, env.FASTIFY_ADDRESS);

        const fetch = await import("node-fetch");

        const res = await fetch(`http://${env.FASTIFY_ADDRESS}:${port}/documentation/yaml`, {
            method: "get",
        });

        if (res.status !== 200)
            throw new Error("Could not download open API spec");

        const text = await res.text();

        await fs.writeFile(__dirname + "/../sdk/spec.yml", text);

        process.exit(0);
    }
}

new SpecDownload().download();

