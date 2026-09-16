import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { promisify } from "node:util";

const require = createRequire(import.meta.url);
const ffprobePath = require("@derhuerst/ffprobe-static");
const execFileAsync = promisify(execFile);

const getVideoDuration = async (localFilePath) => {
    if (!localFilePath) {
        throw new Error("Video file path is required");
    }

    let stdout;

    try {
        ({ stdout } = await execFileAsync(ffprobePath, [
            "-v",
            "error",
            "-show_format",
            "-of",
            "json",
            localFilePath
        ]));
    } catch (error) {
        throw new Error(`Unable to read video metadata: ${error.message}`);
    }

    let metadata;

    try {
        metadata = JSON.parse(stdout);
    } catch {
        throw new Error("Unable to parse video metadata");
    }

    const duration = Number(metadata?.format?.duration);

    if (!Number.isFinite(duration) || duration < 0) {
        throw new Error("Video duration is unavailable or invalid");
    }

    return duration;
};

export { getVideoDuration };
