const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const { extractHexColorFromBuffer } = require("./colorHexExtractor");

function runPythonInference(tempImagePath) {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(
      process.cwd(),
      "ai_extract_details",
      "python",
      "infer_clothing_type.py"
    );

    const pythonCommand = process.platform === "win32" ? "python" : "python3";

    const py = spawn(pythonCommand, [pythonScriptPath, tempImagePath], {
      cwd: process.cwd(),
    });

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    py.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    py.on("error", (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });

    py.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(
            `Python inference failed. Exit code: ${code}. Stderr: ${stderr || "No stderr output"}. Stdout: ${stdout || "No stdout output"}`
          )
        );
      }

      try {
        const parsed = JSON.parse(stdout.trim());

        if (parsed.error) {
          return reject(new Error(parsed.error));
        }

        resolve(parsed);
      } catch (error) {
        reject(new Error(`Invalid Python response: ${stdout}`));
      }
    });
  });
}

async function predictTypeFromBuffer(imageBuffer) {
  const tempFilePath = path.join(
    os.tmpdir(),
    `cloth_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
  );

  try {
    fs.writeFileSync(tempFilePath, imageBuffer);
    const result = await runPythonInference(tempFilePath);
    return result;
  } finally {
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (_) {}
  }
}

async function extractDetailsFromImageBuffer(imageBuffer) {
  const colorResult = await extractHexColorFromBuffer(imageBuffer);
  const typeResult = await predictTypeFromBuffer(imageBuffer);

  return {
    color: colorResult.color,
    type: typeResult.type,
    confidence: Number(typeResult.confidence),
    top_k_predictions: typeResult.top_k_predictions || [],
  };
}

module.exports = {
  extractDetailsFromImageBuffer,
};