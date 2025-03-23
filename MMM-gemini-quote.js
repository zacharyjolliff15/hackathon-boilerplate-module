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

    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.classList.add("MMM-gemini-quote");
        
        // Create a div with class "quote"
        const quoteEl = document.createElement("div");
        quoteEl.classList.add("quote");
        wrapper.appendChild(quoteEl);
    
        // Start the typewriter effect
        this.typeText(quoteEl, this.quoteText || "Loading...");
    
        return wrapper;
    },
    
    typeText: function(element, text) {
        element.innerHTML = ""; // Clear existing text
        let i = 0;
    
        // Add typing class to show the cursor
        element.classList.add("typing");
    
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                element.innerHTML += text[i]; // Add one character at a time
                i++;
    
                // Update the cursor position
                const span = document.createElement("span");
                span.classList.add("cursor");
                element.appendChild(span);
            } else {
                clearInterval(typingInterval); // Stop once the whole text is shown
                // Remove typing class after text is done
                element.classList.remove("typing");
            }
        }, 50); // Typing speed (adjust as needed)
    }
});