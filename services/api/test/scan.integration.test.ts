import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

type ScanStatus = "PROCESSING" | "COMPLETE" | "FAILED";
type ScanRecord = {
    id: string;
    userId: string;
    imagePath: string;
    status: ScanStatus;
    createdAt: Date;
};

type ResultRecord = {
    scanId: string;
    protocol: unknown;
};

const mocked = vi.hoisted(() => {
    const scans = new Map<string, ScanRecord>();
    const results = new Map<string, ResultRecord>();
    let scanCounter = 0;

    const prisma = {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        scan: {
            create: vi.fn(async ({ data }: { data: { userId: string; imagePath: string; status: ScanStatus } }) => {
                scanCounter += 1;
                const id = `scan-${scanCounter}`;
                const row: ScanRecord = {
                    id,
                    userId: data.userId,
                    imagePath: data.imagePath,
                    status: data.status,
                    createdAt: new Date(),
                };
                scans.set(id, row);
                return { id: row.id, status: row.status };
            }),
            findFirst: vi.fn(async ({ where }: { where: { id: string; userId: string } }) => {
                const scan = scans.get(where.id);
                if (!scan || scan.userId !== where.userId) return null;
                const result = results.get(scan.id);
                return {
                    ...scan,
                    result: result ? { protocol: result.protocol } : null,
                };
            }),
            findMany: vi.fn(async ({ where }: { where: { userId: string } }) => {
                return Array.from(scans.values())
                    .filter((scan) => scan.userId === where.userId)
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .map((scan) => ({
                        id: scan.id,
                        status: scan.status,
                        createdAt: scan.createdAt,
                    }));
            }),
            update: vi.fn(async ({ where, data }: { where: { id: string }; data: { status: ScanStatus } }) => {
                const scan = scans.get(where.id);
                if (!scan) throw new Error("scan not found");
                scan.status = data.status;
                scans.set(scan.id, scan);
                return scan;
            }),
        },
        result: {
            create: vi.fn(async ({ data }: { data: { scanId: string; protocol: unknown } }) => {
                results.set(data.scanId, { scanId: data.scanId, protocol: data.protocol });
                return { id: `result-${data.scanId}` };
            }),
        },
        $transaction: vi.fn(async (ops: Array<Promise<unknown>>) => Promise.all(ops)),
    };

    const analyzeScanImage = vi.fn(async () => ({ protocolVersion: "1.0.0", findings: [] }));

    return {
        prisma,
        analyzeScanImage,
        scans,
        results,
        reset: () => {
            scans.clear();
            results.clear();
            scanCounter = 0;
        },
    };
});

vi.mock("../src/db/prisma.js", () => ({
    prisma: mocked.prisma,
}));

vi.mock("../src/engine/analyze.js", () => ({
    analyzeScanImage: mocked.analyzeScanImage,
}));

import { buildApp } from "../src/app.js";

function issueToken(app: ReturnType<typeof buildApp>): string {
    return app.jwt.sign({ sub: "user-1", email: "user@example.com" });
}

describe("Scan flow integration", () => {
    beforeEach(() => {
        mocked.reset();
        vi.clearAllMocks();
    });

    it("POST /scans stores image and starts mocked engine processing", async () => {
        const app = buildApp();
        await app.ready();

        const token = issueToken(app);

        const response = await request(app.server)
            .post("/scans")
            .set("authorization", `Bearer ${token}`)
            .attach("file", Buffer.from("fake-image-bytes"), "panel.png");

        expect(response.statusCode).toBe(202);
        expect(response.body.scan.status).toBe("processing");

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mocked.analyzeScanImage).toHaveBeenCalledTimes(1);
        expect(mocked.scans.get("scan-1")?.status).toBe("COMPLETE");
        expect(mocked.results.get("scan-1")?.protocol).toEqual({ protocolVersion: "1.0.0", findings: [] });

        await app.close();
    });

    it("GET /scans/:id returns scan protocol and status", async () => {
        mocked.scans.set("scan-9", {
            id: "scan-9",
            userId: "user-1",
            imagePath: "uploads/scan-9.png",
            status: "COMPLETE",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
        });
        mocked.results.set("scan-9", {
            scanId: "scan-9",
            protocol: { protocolVersion: "1.0.0", findings: [{ nutrient: "vitamin_d" }] },
        });

        const app = buildApp();
        await app.ready();

        const token = issueToken(app);
        const response = await request(app.server)
            .get("/scans/scan-9")
            .set("authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.scan.id).toBe("scan-9");
        expect(response.body.scan.status).toBe("complete");
        expect(response.body.scan.protocol).toEqual({
            protocolVersion: "1.0.0",
            findings: [{ nutrient: "vitamin_d" }],
        });

        await app.close();
    });

    it("GET /scans returns current user scan history", async () => {
        mocked.scans.set("scan-1", {
            id: "scan-1",
            userId: "user-1",
            imagePath: "uploads/scan-1.png",
            status: "PROCESSING",
            createdAt: new Date("2026-01-02T00:00:00.000Z"),
        });
        mocked.scans.set("scan-2", {
            id: "scan-2",
            userId: "user-1",
            imagePath: "uploads/scan-2.png",
            status: "FAILED",
            createdAt: new Date("2026-01-03T00:00:00.000Z"),
        });
        mocked.scans.set("scan-x", {
            id: "scan-x",
            userId: "someone-else",
            imagePath: "uploads/scan-x.png",
            status: "COMPLETE",
            createdAt: new Date("2026-01-04T00:00:00.000Z"),
        });

        const app = buildApp();
        await app.ready();

        const token = issueToken(app);
        const response = await request(app.server)
            .get("/scans")
            .set("authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.scans).toHaveLength(2);
        expect(response.body.scans[0].id).toBe("scan-2");
        expect(response.body.scans[0].status).toBe("failed");
        expect(response.body.scans[1].id).toBe("scan-1");
        expect(response.body.scans[1].status).toBe("processing");

        await app.close();
    });
});
