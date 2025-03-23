const NodeHelper = require("node_helper");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

module.exports = NodeHelper.create({
    start: function() {
        console.log(`Starting node helper for: ${this.name}`);
        this.initialized = false;
    },
    
    // Initialize the helper with the module's configuration
    initialize: function(config) {
        if (this.initialized) return;
        
        this.config = config;
        
        // Create package.json for ESM support if it doesn't exist
        const moduleDir = path.resolve(__dirname);
        const packagePath = path.join(moduleDir, "package.json");
        
        if (!fs.existsSync(packagePath)) {
            const packageJson = {
                "type": "module",
                "dependencies": {
                    "@google/generative-ai": "latest"
                }
            };
            
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
            
            // Install dependencies
            console.log("Installing Gemini AI dependencies...");
            try {
                execSync("npm install", { cwd: moduleDir });
                console.log("Dependencies installed successfully");
            } catch (error) {
                console.error("Failed to install dependencies:", error);
                return;
            }
        }
        
        // Create the ESM script that will handle the API calls
        const geminiScriptPath = path.join(moduleDir, "gemini-api.mjs");
        
        if (!fs.existsSync(geminiScriptPath)) {
            const scriptContent = `
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function fetchQuote(apiKey) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = "Give me a motivational quote to display on my screen. Only display the quote itself.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        return response.text();
    } catch (error) {
        console.error("Error in Gemini API call:", error);
        return "Error fetching quote.";
    }
}
`;
            fs.writeFileSync(geminiScriptPath, scriptContent);
        }
        
        this.initialized = true;
    },
    
    // Execute the ESM script to fetch a quote
    async getQuote() {
        const moduleDir = path.resolve(__dirname);
        const scriptPath = path.join(moduleDir, "gemini-api.mjs");
        
        try {
            // Use dynamic import to load the ESM module
            const { execSync } = require('child_process');
            const cmd = `node --input-type=module -e "
                import { fetchQuote } from '${scriptPath.replace(/\\/g, '\\\\')}';
                fetchQuote('${this.config.apiKey}').then(quote => console.log(quote));
            "`;
            
            const result = execSync(cmd, { encoding: 'utf8' });
            return result.trim();
        } catch (error) {
            console.error("Error executing Gemini script:", error);
            return "Error fetching quote.";
        }
    },
    
    // Handle socket notifications from the front-end module
    socketNotificationReceived: async function(notification, payload) {
        if (notification === "START") {
            this.initialize(payload);
            // Get initial quote
            this.sendSocketNotification("GET_QUOTE", null);
        }
        
        if (notification === "GET_QUOTE") {
            if (!this.initialized) {
                this.sendSocketNotification("QUOTE_RESULT", "Initializing...");
                return;
            }
            
            const quote = await this.getQuote();
            this.sendSocketNotification("QUOTE_RESULT", quote);
        }
    }
});