import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { Prisma } from "@prisma/client";

const execFileAsync = promisify(execFile);

const ENGINE_CMD = process.env.ENGINE_PYTHON_CMD ?? "python";
const ENGINE_ARGS = ["-m", "laboptimal_engine.pipeline", "--image"];

export async function analyzeScanImage(imagePath: string): Promise<Prisma.InputJsonValue> {
    const { stdout } = await execFileAsync(ENGINE_CMD, [...ENGINE_ARGS, imagePath], {
        maxBuffer: 10 * 1024 * 1024,
    });

    return JSON.parse(stdout.trim()) as Prisma.InputJsonValue;
}
