import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";

import { buildApp } from "../src/app.js";

const app = buildApp();

afterAll(async () => {
    await app.close();
});

describe("GET /health", () => {
    it("returns ok status", async () => {
        await app.ready();

        const response = await request(app.server).get("/health");

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: "ok" });
    });
});
