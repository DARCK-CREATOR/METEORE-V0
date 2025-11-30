
    class WeatherApp {
  constructor() {
    this.API_KEY = 'c6d74fdb22f029fb50c8e073e0f929d6'
    this.defautCity = 'Kinshasa'
    this.init()
  }

  init() {
    this.attacherEvent()
    this.allerPrendreMeteo(this.defautCity)
  }

  attacherEvent() {
    const button = document.querySelector(".btn-search")
    const chercheInput = document.querySelector(".input-search")
    
    button.onclick = () => {
      this.chercherMeteo()
    }
    
    chercheInput.onkeypress = (e) => {
      if (e.key === "Enter") {
        this.chercherMeteo()
      }
    }
  }
  
  chercherMeteo() {
    const chercheInput = document.querySelector(".input-search")
    const city = chercheInput.value.trim()

    if (!city || city.length < 2) {
      this.afficherError("Nom de ville invalide")
      return
    }

    this.encoursRecherche()
    this.allerPrendreMeteo(city)
    chercheInput.value = ''
  }

  async allerPrendreMeteo(city) {
    try {
      const laReponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.API_KEY}&units=metric&lang=fr`
      )
      
      if (!laReponse.ok) throw new Error("Ville non trouvée")
      
      const laReponseValue = await laReponse.json()

      const prevoirMeteo = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.API_KEY}&units=metric&lang=fr`
      )
      
      if (!prevoirMeteo.ok) throw new Error("Erreur lors de la récupération des prévisions")

      const prevoirMeteoValue = await prevoirMeteo.json()

      this.actualiser(laReponseValue, prevoirMeteoValue)

    } catch (error) {
      this.afficherError(error.message)
    }
  }

  actualiser(laReponseValue, prevoirMeteoValue) {
    this.actualiserMeteo(laReponseValue)
    this.actualiserPrevision(prevoirMeteoValue)
  }

  actualiserMeteo(data) {
    document.querySelector('.location').textContent =
      `${data.name.toUpperCase()}, ${data.sys.country}`
    
    document.querySelector('.date').textContent = this.formatDate(new Date())
    document.querySelector('.temp').textContent = `${Math.round(data.main.temp)}°C`
    document.querySelector('.weather').textContent = data.weather[0].description
    document.querySelector('.weather-icon').textContent =  this.allerPrendreMeteoIcon(data.weather[0].main)
    document.querySelector('.weather-icons').textContent =  this.allerPrendreMeteoIcon(data.weather[0].main)

    const details = document.querySelectorAll(".detail .value")
    details[0].textContent = `${Math.round(data.main.humidity)}%`
    details[1].textContent = `${Math.round(data.wind.speed * 3.6)} km/h`
    details[2].textContent = `${Math.round(data.main.pressure)} hPa`
  }

  actualiserPrevision(data) {
    const previsionList = document.querySelector(".forecast-list")
    previsionList.innerHTML = ''

    const joursUniques = new Map()

    data.list.forEach(prevision => {
      const date = new Date(prevision.dt * 1000).toDateString()
      if (!joursUniques.has(date)) {
        joursUniques.set(date, prevision)
      }
    })

    let count = 0
    for (let [_, prevision] of joursUniques) {
      if (count >= 5) break

      const item = document.createElement("div")
      item.className = "forecast-item"
      item.innerHTML = `
        <div class="forecast-date">${this.formatDateCourt(new Date(prevision.dt * 1000))}</div>
        <div class="forecast-icon">${this.allerPrendreMeteoIcon(prevision.weather[0].main)}</div>
        <div class="forecast-temp">${Math.round(prevision.main.temp)}°C</div>
      `
      previsionList.appendChild(item)
      count++
    }
  }

  allerPrendreMeteoIcon(condition) {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️'
    }
    return icons[condition] || '🌈'
  }

  formatDate(date) {
    return date.toLocaleDateString("fr-FR", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  formatDateCourt(date) {
    return date.toLocaleDateString("fr-FR", {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  encoursRecherche() {
    document.querySelector(".location").textContent = "Chargement..."
    document.querySelector('.temp').textContent = "--°C"
    document.querySelector('.weather').textContent = "--"
  }
  
  afficherError(message) {
    let dialo = document.getElementById('dialo')
    dialo.innerHTML=`<p> ${message} </p>`
    dialo.style.animation="flow 1.5s ease"
    dialo.showModal()
    setTimeout(cache,2000)
    function cache() {
      dialo.close()
    }
    document.querySelector(".location").textContent = "Aucune donnée"
    document.querySelector('.date').textContent = "--"
    document.querySelector('.temp').textContent = "--°C"
    document.querySelector('.weather').textContent = "--"
    document.querySelector('.weather-icon').textContent = "❓"
    document.querySelector('.weather-icons').textContent = "❓"
    document.querySelector(".forecast-list").innerHTML = ""
  }
}

class ChatBot {
  constructor() {
    this.conversation = []
    this.meteoKeywords = {
      "temperature": "reponseTemperature",
      "chaud": "reponseChaud",
      "froid": "reponseFroid",
      "pluie": "reponsePluie",
      "soleil": "reponseSoleil",
      "vent": "reponseVent",
      "humidite": "reponseHumidite", // ✅ Corrigé "humiditer" en "humidite"
      "prevision": "reponsePrevision"
    }
    this.init()
  }
  
  init() {
    this.setupChatEvent()
    this.addBotMessage("Bonjour je suis Meteore Ai. Demande moi la meteo les prevision etc...")
  }
  
  setupChatEvent() {
    const chatInput = document.querySelector(".input-send")
    const btn = document.querySelector(".btn-send")
    btn.onclick = () => {
      this.handleUserMessage()
    }
    chatInput.addEventListener("keypress", (e) => { 
      if(e.key === 'Enter') {
        this.handleUserMessage()
      }
    })
  }
  
  handleUserMessage() {
    const chatInput = document.querySelector('.input-send')
    const message = chatInput.value.trim()
    if(message){
      this.addUserMessage(message)
      chatInput.value= ''
      this.processMessage(message)
    }
  }
  
  addUserMessage(message) {
    this.addMessage(message,"user")
  }
  
  addBotMessage(message){
    this.addMessage(message,"bot")
  }
  
  addMessage(text,sender){
    const messageContainer = document.querySelector(".modal-body")
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${sender}-message`
    messageDiv.textContent = text;
    messageContainer.appendChild(messageDiv)
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
  
  processMessage(message){
    const lowerMessage = message.toLowerCase()
    let reponse = "Je n'ai pas compris votre question, Demande-moi la temperature, les prevision etc...."
    for(const [keyword, method] of Object.entries(this.meteoKeywords)) {
      if(lowerMessage.includes(keyword)){
        reponse = this[method]() // ✅ Supprimé le point avant [method]
        break;
      }
    }
    setTimeout(() => {
      this.addBotMessage(reponse)
    },1000)
  }
  
  reponseTemperature() {
    const currentTemp = document.querySelector('.temp').textContent;
    return `🌡️ La température actuelle est de ${currentTemp}.`;
  }
  
  reponseVent() {
    const windSpeed = document.querySelectorAll('.detail .value')[1].textContent;
    return `💨 Le vent souffle à ${windSpeed}.`;
  }
  
  reponseHumidite() { // ✅ Corrigé le nom de la méthode
    const humidity = document.querySelectorAll('.detail .value')[0].textContent;
    return `💧 L'humidité est de ${humidity}.`;
  }
  
  reponsePluie() {
    const weatherDesc = document.querySelector('.weather').textContent.toLowerCase();
    if (weatherDesc.includes('pluie') || weatherDesc.includes('pluvieux')) {
      return `🌧️ Oui, il pleut actuellement. Pense à prendre un parapluie !`;
    } else {
      return `☀️ Non, pas de pluie pour le moment. Temps : ${weatherDesc}`;
    }
  }
  
  reponseSoleil() {
    const weatherDesc = document.querySelector('.weather').textContent;
    return `☀️ Conditions actuelles : ${weatherDesc}`;
  }
  
  reponseChaud() {
    const temp = document.querySelector('.temp').textContent;
    const tempNum = parseInt(temp);
    if (tempNum > 25) {
      return `🔥 Oui il fait chaud ! ${temp} - Pense à bien t'hydrater.`;
    } else {
      return `❄️ Pas vraiment, il fait ${temp} - Température plutôt fraîche.`;
    }
  }
  
  reponseFroid() {
    const temp = document.querySelector('.temp').textContent;
    const tempNum = parseInt(temp);
    if (tempNum < 15) {
      return `🥶 Oui il fait froid ! ${temp} - Couvre-toi bien.`;
    } else {
      return `🌡️ Pas vraiment, il fait ${temp} - Température plutôt douce.`;
    }
  }
  
  reponsePrevision() {
    const forecastItems = document.querySelectorAll('.forecast-item');
    let response = "📅 Prévisions des 5 prochains jours :\n";
    
    forecastItems.forEach((item, index) => {
      const date = item.querySelector('.forecast-date').textContent;
      const temp = item.querySelector('.forecast-temp').textContent;
      response += `• ${date} : ${temp}\n`;
    });
    
    return response;
  }
  
  prendreMeteoActuelle() {
    return {
      city: document.querySelector(".location").textContent,
      temp: document.querySelector(".temp").textContent,
      description: document.querySelector(".weather").textContent, // ✅ Ajouté le point devant weather
      humidity: document.querySelectorAll(".detail .value")[0].textContent,
      wind: document.querySelectorAll(".detail .value")[1].textContent,
    }
  }
}

// ✅ INITIALISATION CORRECTE
document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp()
  new ChatBot()
})
  