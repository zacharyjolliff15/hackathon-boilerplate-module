const NodeHelper = require("node_helper");
const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

module.exports = NodeHelper.create({
  start: function () {
    console.log(`Starting node helper for: ${this.name}`);
    this.initialized = false;
  },

  // Initialize our helper once, on "START"
  initialize: function (config) {
    if (this.initialized) return;
    this.config = config;

    // 1) Ensure the Gemini dependencies are in place
    const moduleDir = path.resolve(__dirname);
    const packagePath = path.join(moduleDir, "package.json");

    if (!fs.existsSync(packagePath)) {
      const packageJson = {
        "type": "module",
        "dependencies": {
          "@google/generative-ai": "latest",
        },
      };

      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

      // Attempt npm install (this is built-in; no extra packages)
      console.log("Installing Gemini AI dependencies...");

      try {
        execSync("npm install", { cwd: moduleDir });
        console.log("Dependencies installed successfully");
      } catch (error) {
        console.error("Failed to install dependencies:", error);
      }
    }

    // 2) Spawn Python script for Vosk speech-to-text
    const pythonScriptPath = path.join(moduleDir, "speech_to_text.py");
    console.log("Spawning Python script...");

    this.pythonProcess = spawn("python3", [pythonScriptPath]); // or "python" if your Pi uses that command

    // Log any Python script stdout (includes recognized text and debug logs)
    this.pythonProcess.stdout.on("data", async (data) => {
      const recognizedText = data.toString().trim();

      // If the recognized text is actually speech, pass it to Gemini
      if (recognizedText && !recognizedText.startsWith("Python:")) {
        console.log("Recognized from Python:", recognizedText);
        const geminiResponse = await this.callGeminiAPI(recognizedText);
        this.sendSocketNotification("QUOTE_RESULT", geminiResponse);
      } else {
        console.log("Python says:", recognizedText);
      }
    });

    // Log Python errors
    this.pythonProcess.stderr.on("data", (err) => {
      console.error("Python error:", err.toString());
    });

    // If Python closes
    this.pythonProcess.on("close", (code) => {
      console.log(`Python process exited with code ${code}`);
    });

    this.initialized = true;
  },

  // This function calls Gemini using your gemini-api.mjs file
  async callGeminiAPI(promptText) {
    const moduleDir = path.resolve(__dirname);
    const scriptPath = path.join(moduleDir, "gemini-api.mjs");

    try {
      // We'll run a one-liner that imports fetchQuote and calls it
      const cmd = `node --input-type=module -e "
        import { fetchQuote } from '${scriptPath.replace(/\\/g, '\\\\')}';
        fetchQuote('${this.config.apiKey}', \`${promptText}\`).then(response => console.log(response));
      "`;

      const result = execSync(cmd, { encoding: 'utf8' });
      return result.trim();
    } catch (error) {
      console.error("Error calling Gemini script:", error);
      return "Error calling Gemini.";
    }
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "START") {
      this.initialize(payload);
      // Optionally request an initial quote if you want:
      // this.sendSocketNotification("GET_QUOTE", null);
    }

    if (notification === "GET_QUOTE") {
      if (!this.initialized) {
        this.sendSocketNotification("QUOTE_RESULT", "Gemini is initializing...");
        return;
      }

      // Example usage: some default prompt
      this.callGeminiAPI("Tell me a random interesting fact!")
        .then((quote) => {
          this.sendSocketNotification("QUOTE_RESULT", quote);
        });
    }
  }
});
