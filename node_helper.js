const NodeHelper = require("node_helper");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

module.exports = NodeHelper.create({
    start: function() {
        console.log(`Starting node helper for: ${this.name}`);
        this.initialized = false;
    },
    
    // initialize node helperß
    initialize: function(config) {
        if (this.initialized) return;
        
        this.config = config;
        
        //package.json content
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
            
            // get dependencies
            console.log("Installing Gemini AI dependencies...");
            try {
                execSync("npm install", { cwd: moduleDir });
                console.log("Dependencies installed successfully");
            } catch (error) {
                console.error("Failed to install dependencies:", error);
                return;
            }
        }
        
        // handle API calls
        const geminiScriptPath = path.join(moduleDir, "gemini-api.mjs");
        
        if (!fs.existsSync(geminiScriptPath)) {
            const scriptContent = fs.writeFileSync(geminiScriptPath, scriptContent);
        }
        
        this.initialized = true;
    },
    
    // fetch quotes
    async getQuote() {
        const moduleDir = path.resolve(__dirname);
        const scriptPath = path.join(moduleDir, "gemini-api.mjs");
        
        try {
            // load module
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