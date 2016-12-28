var statusbar = document.getElementById('statusbar');

class CardGraph {
  constructor(title) {
    this.title = title
    this.dataSet = []
    this.root = this.createElement()
  }

  set(dataArray) {
    this.dataSet = dataArray
  }

  append(dataPoint) {
    this.dataSet[this.dataSet.length] = dataPoint
  }

  createElement() {
    let root = document.createElement('div')
      root.classList.add('graph')
      root.innerText = this.title
    return root
  }
}

class DashboardCard {
  constructor(cardId, title, iconSrc = null, units = null, graph = null) {
    statusbar.innerText += "Dashboard card ctor: " + cardId + "\n"    

    this.cardId = cardId
    this.title = title

    iconSrc = iconSrc || "/images/data_128x128.png"
    this.iconSrc = iconSrc
    
    this.units = units
    
    this.valueElement = null
    this.dateElement = null
    this.isHidden = false

    this.graph = graph
    this.root = this.createElement()
  }

  createElement() {
    // root element
    let root = document.createElement('div')
    root.id = this.id
    root.classList.add('card')
    root.classList.add('card-visible');
    
    // container
    let cardContainer = document.createElement('div')
    cardContainer.classList.add('cardcontainer')
    root.appendChild(cardContainer)

    // title
    let cardTitle = document.createElement('div')
    cardTitle.classList.add('cardtitle')
    cardTitle.innerText = this.title
    cardContainer.appendChild(cardTitle)

    // icon
    let cardIcon = document.createElement('img')
    cardIcon.classList.add('cardicon')
    cardIcon.src = this.iconSrc    
    cardContainer.appendChild(cardIcon)

    // value container
    let valueContainer = document.createElement('div')
    valueContainer.classList.add('cardvalue')    
    cardContainer.appendChild(valueContainer)    

    // value
    this.valueElement = document.createElement('span')
    this.valueElement.classList.add('value')
    this.valueElement.innerText = "VALUE"
    valueContainer.appendChild(this.valueElement)

    // units
    if (this.units) {
      let unitsEl = document.createElement('span')
      unitsEl.classList.add('units')
      unitsEl.innerText = this.units
      valueContainer.appendChild(unitsEl)
    }

    // date
    this.dateElement = document.createElement('div')
    this.dateElement.classList.add('date');
    this.dateElement.innerText = 'date updated';
    cardContainer.appendChild(this.dateElement);

    // graph
    if (this.graph) {      
      cardContainer.appendChild(this.graph.root);
    }

    return root;
  }

  updateCardElements(dataPoint) {
    if (!isNaN(dataPoint.value)) {
      this.valueElement.innerText = dataPoint.value.toFixed(1)    
    } else {
      this.valueElement.innerText = dataPoint.value    
    }
    
    if (dataPoint.date) {
      this.dateElement.innerText = dataPoint.date.toLocaleString()
    } else {
      this.dateElement.innerText = ""
    }
    
  }

  setData(data) {
    if (data) {
      // card id must match a property name in data
      let value = data[this.cardId]
      if (value) {
        let dataPoint = {
          value: value,
          date: data.date
        };
        this.updateCardElements(dataPoint)
        if (this.graph) {
          this.graph.append(dataPoint);
        }
      }
    } else {
      this.updateCardElements({ value: "Err", date: "" });
    }
  }

  setIsHidden(isHidden) {
    this.isHidden = isHidden;
    if (isHidden) {
      this.root.classList.remove('card-visible')
      this.root.classList.add('card-hidden')
    } else {
      this.root.classList.remove('card-hidden')
      this.root.classList.add('card-visible')
    }
  }
}

class Dashboard {
  constructor() {
    statusbar.innerText += "Dashboard ctor\n";

    this.root = document.getElementById('dashboard')
    this.cards = []
    setInterval(this.getCurrentData.bind(this), 5000)
    this.getCurrentData()
    statusbar.innerText += "Dashboard ctor done\n";
  }

  getCurrentData() {
    let xhr = new XMLHttpRequest()
    xhr.addEventListener('load', function(evt) {
      if (xhr.status == 200) {
        try {
          let data = JSON.parse(xhr.responseText)
          data.date = new Date(data.date)
          this.setCardsData(data)
        } catch (error) {
          console.log('> Could not parse data', error)
          statusbar.innerText += error
          this.setCardsData(null)
        }
      } else {
        console.log('> No valid response')
        statusbar.innerText += 'No valid response'
        this.setCardsData(null)
      }
      console.log(this.response);
    }.bind(this))

    xhr.addEventListener('error', function(evt) {
      this.setCardsData(null)
    }.bind(this))

    xhr.open('GET', '/api/currentData')
    xhr.send()
  }

  setCardsData(data) {
    this.cards.forEach(c => c.setData(data))
  }

  addCard(dashboardCard) {
    this.cards.push(dashboardCard)
    this.root.appendChild(dashboardCard.root)
    dashboardCard.root.addEventListener('click', this.cardOnClick.bind(this));
  }

  cardOnClick (evt) {
    let el = evt.target
      while (el && !el.classList.contains('card')) {
        el = el.parentNode;
      }
      if (el && el.id) {
        let card = this.cards.find(c => c.id === el.id);
        if (card) {          
          this.cards.forEach(c => {
            if (c !== card) c.setIsHidden(!c.isHidden)
          })
        }
      }
    }
};

statusbar.innerText += "Starting\n";

var dashboard = new Dashboard();

let temperatureGraph = new CardGraph("Temperature graph");
let humidityGraph = new CardGraph("Relative humidity graph");

var temp = new DashboardCard('temp', 'Temperature', '/images/temperature_128x128.png', '°C', temperatureGraph);
var relhumidity = new DashboardCard('relhumidity', 'Rel. Humidity', '/images/relhumidity_128x128.png', '%', humidityGraph);

dashboard.addCard(temp);
dashboard.addCard(relhumidity);



dashboard.addCard(new DashboardCard('t1', 'T1', '/images/data_128x128.png', 'Units'));
dashboard.addCard(new DashboardCard('t2', 'T2', '/images/data_128x128.png'));
//dashboard.addCard(new DashboardCard('t3', 'T3', '/images/data_128x128.png', 'U'));
//dashboard.addCard(new DashboardCard('t4', 'T4', '/images/data_128x128.png', 'U'));

