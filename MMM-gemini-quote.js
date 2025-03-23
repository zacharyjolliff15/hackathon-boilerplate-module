Module.register("MMM-gemini-quote", {

    defaults: {
        updateInterval: 30,        
        fadeSpeed: 30,            
        apiKey: 'AIzaSyAauA2p8okahW6ercDjloFvfJ98bqNX_0I', 
    },

    getStyles: function() {
        return ["MMM-gemini-quote.css"];
    },
    
    start: function() {
        Log.info("Starting module: " + this.name);
        this.quoteText = "Loading..."; // Initial text

        this.getQuote(); // Fetch the initial quote

        // Update at regular intervals
        setInterval(() => {
            this.getQuote();
        }, this.config.updateInterval * 1000);
    },

    async getQuote() {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');

        const genAI = new GoogleGenerativeAI(this.config.apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = "Give me a motivational quote to display on my screen. Only display the quote itself.";

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            this.quoteText = response.text();

            // Trigger re-render after fetching the quote
            this.updateDom(this.config.fadeSpeed * 1000);
        } catch (error) {
            console.error("Error fetching quote from Gemini:", error);
            this.quoteText = "Error fetching quote.";
            this.updateDom(this.config.fadeSpeed * 1000);
        }
    },

    getDom: function() {
        var wrapper = document.createElement("div");

        var quote = document.createElement("div");
        quote.className = "small";
        quote.innerHTML = this.quoteText || "Loading...";

        wrapper.appendChild(quote);

        return wrapper;
    }
});
