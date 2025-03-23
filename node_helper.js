const speech = require("@google-cloud/speech");

module.exports = NodeHelper.create({
    start: function() {
        console.log(`Starting node helper for: ${this.name}`);
        this.initialized = false;
        this.client = null;
    },

    initialize: function(config) {
        if (this.initialized) return;
        this.config = config;

        // Initialize Google Cloud Speech client
        this.client = new speech.SpeechClient();

        // Start listening to microphone
        this.startListening();
        this.initialized = true;
    },

    startListening: function() {
        console.log("Starting microphone for speech recognition...");
        const mic = record.record({
            sampleRate: 16000,
            channels: 1,
            audioType: "raw"
        });

        const recognizeStream = this.client
            .streamingRecognize({
                config: {
                    encoding: "LINEAR16",
                    sampleRateHertz: 16000,
                    languageCode: "en-US"
                },
                interimResults: false
            })
            .on("data", (data) => {
                const text = data.results[0].alternatives[0].transcript;
                console.log("Recognized Text:", text);

                // Send recognized text to Gemini
                this.sendToGemini(text);
            })
            .on("error", (err) => {
                console.error("Speech recognition error:", err);
            });

        mic.stream().pipe(recognizeStream);
    },

    async sendToGemini(text) {
        try {
            const geminiResponse = await this.getQuote(text);
            this.sendSocketNotification("QUOTE_RESULT", geminiResponse);
        } catch (error) {
            console.error("Error sending text to Gemini:", error);
        }
    },

    async getQuote(text) {
        const moduleDir = path.resolve(__dirname);
        const scriptPath = path.join(moduleDir, "gemini-api.mjs");

        try {
            const { execSync } = require("child_process");
            const cmd = `node --input-type=module -e "
                import { fetchQuote } from '${scriptPath.replace(/\\/g, '\\\\')}';
                fetchQuote('${this.config.apiKey}', '${text}').then(quote => console.log(quote));
            "`;

            const result = execSync(cmd, { encoding: "utf8" });
            return result.trim();
        } catch (error) {
            console.error("Error executing Gemini script:", error);
            return "Error fetching quote.";
        }
    },

    socketNotificationReceived: async function(notification, payload) {
        if (notification === "START") {
            this.initialize(payload);
        }
    }
});