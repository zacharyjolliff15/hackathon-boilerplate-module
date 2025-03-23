const NodeHelper = require("node_helper");
const { exec } = require("child_process");
const path = require("path");
const socketIO = require("socket.io");

module.exports = NodeHelper.create({
    start: function () {
        console.log(`Starting node helper for: ${this.name}`);
        this.initialized = false;

        // Start socket server to receive from Python
        const io = socketIO(8080, {
            cors: {
                origin: "*"
            }
        });

        io.on("connection", (socket) => {
            console.log("Python connected to MagicMirror");

            socket.on("speech_to_text", (text) => {
                console.log(`Received text from Python: ${text}`);
                this.sendToGemini(text);
            });
        });
    },

    async sendToGemini(text) {
        try {
            const moduleDir = path.resolve(__dirname);
            const scriptPath = path.join(moduleDir, "fetchQuote.mjs");

            const command = `node ${scriptPath} "${this.config.apiKey}" "${text}"`;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing Gemini script: ${stderr}`);
                    this.sendSocketNotification("QUOTE_RESULT", "Error fetching quote.");
                    return;
                }
                console.log(`Gemini Response: ${stdout}`);
                this.sendSocketNotification("QUOTE_RESULT", stdout.trim());
            });
        } catch (error) {
            console.error("Error in Gemini API call:", error);
            this.sendSocketNotification("QUOTE_RESULT", "Error fetching quote.");
        }
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "START") {
            this.config = payload;
        }
    }
});
