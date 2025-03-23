import { GoogleGenerativeAI } from "@google/generative-ai";

Module.register("MMM-gemini-quote", {
    defaults: {
        updateInterval: 10, // Refresh quotes every 30 seconds
        apiKey: 'AIzaSyAauA2p8okahW6ercDjloFvfJ98bqNX_0I',
        fadeSpeed: 3
    },

    // Load CSS
    getStyles: function() {
        return ["MMM-gemini-quote.css"];
    },

    // Called by MagicMirror when module starts 
    start: function() {
        Log.info("Starting module: " + this.name);
        this.quoteText = null; // Quote placeholder

        // Fetch quote immediately
        this.fetchQuote();

        // Then fetch quote every updateInterval seconds
        setInterval(() => {
            this.fetchQuote();
        }, this.config.updateInterval * 1000);
    },

    // Asynchronously fetch gemini quote & store it 
    fetchQuote: async function() {
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(this.config.apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const prompt = "Give me a motivational quote to display on my screen. Only display the quote itself.";
            const result = await model.generateContent(prompt);
            const response = await result.response;

            this.quoteText = response.text();
        } catch (error) {
            console.error("Error fetching quote from Gemini:", error);
            this.quoteText = "Error fetching quote.";
        }

        // Tell MagicMirror to redraw DOM
        this.updateDom(this.config.fadeSpeed);
    },

    // Build DOM to display
    getDom: function() {
        const wrapper = document.createElement("div");
        const quote = document.createElement("div");
        quote.className = "small";

        // If we haven't fetched a quote yet, just show "Loading..."
        quote.innerHTML = this.quoteText || "Loading...";
        wrapper.appendChild(quote);

        return wrapper;
    }
});
