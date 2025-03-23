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
        wrapper.classList.add("MMM-gemini-quote");
        
        // Create a div with class "quote"
        const quoteEl = document.createElement("div");
        quoteEl.classList.add("quote");
        
        // Put the actual text into a data attribute
        // The CSS above uses content: attr(data-text) in ::before
        quoteEl.setAttribute("data-text", this.quoteText || "Loading...");
        
        wrapper.appendChild(quoteEl);
        return wrapper;
      },
});