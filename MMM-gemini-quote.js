import { GoogleGenerativeAI } from "@google/generative-ai";

Module.register("MMM-gemini-quote", {
    defaults: {
        updateInterval: 15,     // in seconds
        fadeSpeed: 3,           // in seconds
        apiKey: 'AIzaSyAauA2p8okahW6ercDjloFvfJ98bqNX_0I', // Add your Gemini API key here
    },

    getStyles: function() {
        return ["MMM-gemini-quote.css"];
    },

    // Define start variables
    start: function() {
        Log.info("Starting module: " + this.name);
        this.loaded = false;
        this.quote = "Loading...";
        
        // Schedule first update
        var self = this;
        setTimeout(function() {
            self.updateQuote();
            // Schedule regular updates
            setInterval(function() {
                self.updateQuote();
            }, self.config.updateInterval * 1000);
        }, this.config.initialLoadDelay * 1000);
    },

    // Update the quote
    updateQuote: async function() {
        this.quote = this.getQuote();
        this.loaded = true;
        this.updateDom(this.config.fadeSpeed * 10);
    },

    // Get quote from Gemini API
    getQuote: async function() {

        const genAI = new GoogleGenerativeAI(this.config.apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = "Give me a motivational quote to display on my screen. Only display the quote itself.";
        const result = await model.generateContent(prompt);
        return result.response.text();
    },

    // Override getDom - this should be synchronous
    getDom: function() {
        var wrapper = document.createElement("div");
        
        if (!this.loaded) {
            wrapper.innerHTML = "Loading...";
            wrapper.className = "dimmed light small";
            return wrapper;
        }
        
        var quoteElement = document.createElement("div");
        quoteElement.className = "quote";
        quoteElement.innerHTML = this.quote;
        
        wrapper.appendChild(quoteElement);
        
        return wrapper;
    }
});