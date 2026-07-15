import argon2 from "argon2";
import type { FastifyInstance } from "fastify";

import { prisma } from "../db/prisma.js";
import { authenticate } from "./middleware.js";

interface AuthBody {
    email: string;
    password: string;
}

const authBodySchema = {
    type: "object",
    required: ["email", "password"],
    additionalProperties: false,
    properties: {
        email: { type: "string", minLength: 5, maxLength: 320 },
        password: { type: "string", minLength: 8, maxLength: 128 },
    },
} as const;

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export async function registerAuthRoutes(app: FastifyInstance) {
    app.post<{ Body: AuthBody }>("/auth/signup", { schema: { body: authBodySchema } }, async (request, reply) => {
        const body = request.body;

        if (!body.email.includes("@")) {
            return reply.code(400).send({ error: { message: "Invalid email or password" } });
        }

        const email = normalizeEmail(body.email);

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return reply.code(409).send({ error: { message: "Email already in use" } });
        }

        const passwordHash = await argon2.hash(body.password);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
            },
            select: {
                id: true,
                email: true,
            },
        });

        const token = await reply.jwtSign({ sub: user.id, email: user.email });

        return reply.code(201).send({ token, user });
    });

    app.post<{ Body: AuthBody }>("/auth/login", { schema: { body: authBodySchema } }, async (request, reply) => {
        const body = request.body;

        if (!body.email.includes("@")) {
            return reply.code(400).send({ error: { message: "Invalid email or password" } });
        }

        const email = normalizeEmail(body.email);
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return reply.code(401).send({ error: { message: "Invalid credentials" } });
        }

        const ok = await argon2.verify(user.passwordHash, body.password);
        if (!ok) {
            return reply.code(401).send({ error: { message: "Invalid credentials" } });
        }

        const token = await reply.jwtSign({ sub: user.id, email: user.email });

        return reply.send({
            token,
            user: {
                id: user.id,
                email: user.email,
            },
        });
    });

    app.get("/auth/me", { preHandler: authenticate }, async (request) => {
        const user = await prisma.user.findUnique({
            where: { id: request.user.sub },
            select: { id: true, email: true, createdAt: true },
        });

        if (!user) {
            return { user: null };
        }

        return { user };
    });
}
