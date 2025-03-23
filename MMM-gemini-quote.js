Module.register("MMM-gemini-quote", {
    defaults: {
      apiKey: 'AIzaSyAauA2p8okahW6ercDjloFvfJ98bqNX_0I',
      fadeSpeed: 3,
      listeningMessage: "Listening..."
    },
  
    getStyles: function () {
      return ["MMM-gemini-quote.css"];
    },
  
    start: function () {
      Log.info("Starting module: " + this.name);
      this.quoteText = this.config.listeningMessage;
      this.sendSocketNotification("START", this.config);
    },
  
    socketNotificationReceived: function (notification, payload) {
      if (notification === "QUOTE_RESULT") {
        this.quoteText = payload;
        this.updateDom(this.config.fadeSpeed);
      }
    },
  
    getDom: function () {
      const wrapper = document.createElement("div");
      wrapper.classList.add("MMM-gemini-quote");
  
      const quoteEl = document.createElement("div");
      quoteEl.classList.add("quote");
  
      wrapper.appendChild(quoteEl);
  
      this.typeText(quoteEl, this.quoteText);
  
      return wrapper;
    },
  
    typeText: function (element, text) {
      element.innerHTML = "";
      let i = 0;
      element.classList.add("typing");
  
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          element.innerHTML += text[i];
          i++;
        } else {
          clearInterval(typingInterval);
          element.classList.remove("typing");
        }
      }, 50);
    }
  });
  