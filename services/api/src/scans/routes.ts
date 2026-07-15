import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

import type { FastifyInstance } from "fastify";

import { authenticate } from "../auth/middleware.js";
import { prisma } from "../db/prisma.js";
import { analyzeScanImage } from "../engine/analyze.js";

const UPLOAD_DIR = join(process.cwd(), "uploads");
const scanIdParamsSchema = {
    type: "object",
    required: ["id"],
    additionalProperties: false,
    properties: {
        id: { type: "string", minLength: 1 },
    },
} as const;

function safeExtension(filename?: string): string {
    const ext = extname(filename ?? "").toLowerCase();
    if (!ext || ext.length > 10) return ".bin";
    return ext;
}

function toClientStatus(status: "PROCESSING" | "COMPLETE" | "FAILED"): string {
    return status.toLowerCase();
}

async function processScan(scanId: string, imagePath: string): Promise<void> {
    try {
        const protocol = await analyzeScanImage(imagePath);

        await prisma.$transaction([
            prisma.result.create({
                data: {
                    scanId,
                    protocol,
                },
            }),
            prisma.scan.update({
                where: { id: scanId },
                data: { status: "COMPLETE" },
            }),
        ]);
    } catch {
        await prisma.scan.update({
            where: { id: scanId },
            data: { status: "FAILED" },
        });
    }
}

export async function registerScanRoutes(app: FastifyInstance) {
    app.post("/scans", { preHandler: authenticate }, async (request, reply) => {
        const file = await request.file();
        if (!file) {
            return reply.code(400).send({ error: { message: "Image file is required" } });
        }

        const ext = safeExtension(file.filename);
        const filename = `${randomUUID()}${ext}`;

        await mkdir(UPLOAD_DIR, { recursive: true });
        const path = join(UPLOAD_DIR, filename);

        const bytes = await file.toBuffer();
        if (!bytes.length) {
            return reply.code(400).send({ error: { message: "Uploaded file is empty" } });
        }

        await writeFile(path, bytes);

        const scan = await prisma.scan.create({
            data: {
                userId: request.user.sub,
                imagePath: path,
                status: "PROCESSING",
            },
            select: {
                id: true,
                status: true,
            },
        });

        void processScan(scan.id, path);

        return reply.code(202).send({
            scan: {
                id: scan.id,
                status: toClientStatus(scan.status),
            },
        });
    });

    app.get("/scans/:id", { preHandler: authenticate, schema: { params: scanIdParamsSchema } }, async (request, reply) => {
        const { id } = request.params as { id: string };

        const scan = await prisma.scan.findFirst({
            where: {
                id,
                userId: request.user.sub,
            },
            include: {
                result: {
                    select: {
                        protocol: true,
                    },
                },
            },
        });

        if (!scan) {
            return reply.code(404).send({ error: { message: "Scan not found" } });
        }

        return {
            scan: {
                id: scan.id,
                status: toClientStatus(scan.status),
                protocol: scan.result?.protocol ?? null,
            },
        };
    });

    app.get("/scans", { preHandler: authenticate }, async (request) => {
        const scans = await prisma.scan.findMany({
            where: { userId: request.user.sub },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                status: true,
                createdAt: true,
            },
        });

        return {
            scans: scans.map((scan) => ({
                id: scan.id,
                status: toClientStatus(scan.status),
                createdAt: scan.createdAt,
            })),
        };
    });
}
