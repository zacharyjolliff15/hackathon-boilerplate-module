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

		var self = this;
		setInterval(async function() {
			await self.updateDom(self.config.fadeSpeed * 1000);
		}, this.config.updateInterval * 1000);
	},

	// get quote
	async getQuote() {
		const { GoogleGenerativeAI } = await import('@google/generative-ai');

		const genAI = new GoogleGenerativeAI(this.config.apiKey);
		const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
		const prompt = "Give me a motivational quote to display on my screen. Only display the quote itself.";

		try {
			const result = await model.generateContent(prompt);
			const response = await result.response;
			return response.text();
		} catch (error) {
			console.error("Error fetching quote from Gemini:", error);
			return "Error fetching quote.";
		}
	},

	// override getDom and display quote
	getDom: async function() {
        const quoteText = await this.getQuote();
    
        var wrapper = document.createElement("div");
    
        var quote = document.createElement("div");
        quote.className = "small";
        quote.innerHTML = quoteText;
    
        wrapper.appendChild(quote);
    
        return wrapper;
    }
});
