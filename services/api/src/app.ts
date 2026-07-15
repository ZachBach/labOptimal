import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";

import { registerAuthRoutes } from "./auth/routes.js";
import "./auth/types.js";
import { getConfig } from "./config.js";
import { registerScanRoutes } from "./scans/routes.js";

export function buildApp(): FastifyInstance {
    const config = getConfig();
    const app = Fastify({ logger: true });

    app.register(fastifyRateLimit, {
        max: 100,
        timeWindow: "1 minute",
    });

    app.register(fastifyJwt, {
        secret: config.jwtSecret,
        sign: {
            expiresIn: config.jwtExpiresIn,
        },
    });
    app.register(fastifyMultipart, {
        limits: {
            fileSize: 10 * 1024 * 1024,
            files: 1,
        },
    });

    app.register(registerAuthRoutes);
    app.register(registerScanRoutes);

    app.setErrorHandler((error: FastifyError, request, reply) => {
        request.log.error(error);

        const statusCode = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
        const message = error.validation ? "Request validation failed" : error.message;

        reply.code(statusCode).send({
            error: {
                message,
            },
        });
    });

    app.get("/health", async () => {
        return { status: "ok" };
    });

    return app;
}
