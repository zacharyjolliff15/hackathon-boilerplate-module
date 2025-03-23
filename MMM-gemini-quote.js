Module.register("MMM-gemini-quote", {
    defaults: {
        updateInterval: 15, // Refresh quotes every 15 seconds
        apiKey: 'AIzaSyAauA2p8okahW6ercDjloFvfJ98bqNX_0I',      // Your Gemini API key
        fadeSpeed: 3        // Animation speed
    },

    // Load CSS
    getStyles: function() {
        return ["MMM-gemini-quote.css"];
    },

    // Called by MagicMirror when module starts
    start: function() {
        Log.info("Starting module: " + this.name);
        this.quoteText = null; // Quote placeholder
        
        // Tell node_helper to start
        this.sendSocketNotification("START", this.config);
        
        // Schedule regular updates
        setInterval(() => {
            this.sendSocketNotification("GET_QUOTE", null);
        }, this.config.updateInterval * 1000);
    },

    // Socket notification received from node_helper
    socketNotificationReceived: function(notification, payload) {
        if (notification === "QUOTE_RESULT") {
            // Update the displayed quote with what we got from the helper
            this.quoteText = payload;
            this.updateDom(this.config.fadeSpeed);
        }
    },

    // Build DOM to display
    getDom: function() {
        const wrapper = document.createElement("div");
        // Add the top-level module class
        wrapper.classList.add("MMM-gemini-quote");
        
        // Create the "quote" div, using the .quote class
        const quote = document.createElement("div");
        quote.classList.add("quote"); // This must match your CSS “.quote” selector
        
        // If we haven't fetched a quote, show "Loading..."
        quote.textContent = this.quoteText || "Loading...";
        
        // Append to wrapper
        wrapper.appendChild(quote);
        
        return wrapper;
    },
});