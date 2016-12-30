var statusbar = document.getElementById('statusbar');

class CardGraph {
  constructor(graphId, title) {
    this.graphId = graphId
    this.title = title
    this.dataSet = []

    let { rootElement, chartElement } = this.createElement()
    this.rootElement = rootElement
    this.chartElement = chartElement
    
    this.chart = null
  }

  createChart() {
    // this must be called when the root is added to the DOM
    this.chart = new Chart(this.chartElement, {
      type: 'line',
      pointRadius: 1,
      datasets: [{
        label: this.title,
      }],
      options: {       
        legend: {
          display: false
        },
        scales: {
            xAxes: [{
                display: true,
                type: 'time',
                time: {
                    unit: 'minute'
                }
            }]
        }
      }
    })
  }

  set(dataArray) {
    this.dataSet = dataArray
  }

  prepareData() {
    if (this.chart.data.datasets.length == 0) {
      this.chart.data.datasets[0] = [{
        label: this.title,
        data: []
      }]
    }
  }

  appendData(dataPoint) {    
    this.dataSet[this.dataSet.length] = dataPoint
    if (this.chart) {
      this.chart.data.labels.push(dataPoint.date)
      if (this.chart.data.datasets.length == 0) {
        this.chart.data.datasets[0] = [{
          label: this.title,
          data: [dataPoint.value]
        }]
      } else {
        this.chart.data.datasets[0].data.push(dataPoint.value)
      }
      
      this.chart.update()
    }
  }

  createElement() {
    let rootElement = document.createElement('div')
      rootElement.id = this.graphId
      rootElement.classList.add('graph')

    let chartElement = document.createElement('canvas')
    rootElement.appendChild(chartElement)

    return { rootElement, chartElement }
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
    this.graph = graph

    this.isHidden = false
    this.hasError = false

    let elements = this.createElement()
    
    this.titleElement = elements.titleElement
    this.valueElement = elements.valueElement
    this.dateElement = elements.dateElement
    this.rootElement = elements.rootElement
  }

  createElement() {
    // rootElement element
    let rootElement = document.createElement('div')
    rootElement.id = this.cardId
    rootElement.classList.add('card')
    rootElement.classList.add('card-visible');
    
    // container
    let cardContainer = document.createElement('div')
    cardContainer.classList.add('cardcontainer')
    rootElement.appendChild(cardContainer)

    // title
    let titleElement = document.createElement('div')
    titleElement.classList.add('cardtitle')
    titleElement.innerText = this.title
    cardContainer.appendChild(titleElement)

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
    let valueElement = document.createElement('span')
    valueElement.classList.add('value')
    valueElement.innerText = "VALUE"
    valueContainer.appendChild(valueElement)

    // units
    if (this.units) {
      let unitsEl = document.createElement('span')
      unitsEl.classList.add('units')
      unitsEl.innerText = this.units
      valueContainer.appendChild(unitsEl)
    }

    // date
    let dateElement = document.createElement('div')
    dateElement.classList.add('date');
    dateElement.innerText = 'date updated';
    cardContainer.appendChild(dateElement);

    // graph
    if (this.graph) {      
      cardContainer.appendChild(this.graph.rootElement);
    }

    return {
      rootElement,
      titleElement,
      valueElement,
      dateElement,
    };
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

  appendData(data) {
    if (data) {
      this.setHasError(false)
      // card id must match a property name in data
      let value = data[this.cardId]
      if (value) {
        let dataPoint = {
          value: value,
          date: data.date
        };
        this.updateCardElements(dataPoint)
        if (this.graph) {
          this.graph.appendData(dataPoint);
        }
      }
    } else {
      this.setHasError(true)
      this.updateCardElements({ value: "Err", date: "" });
    }
  }

  setIsHidden(isHidden) {
    if (this.isHidden != isHidden) {
      this.isHidden = isHidden
      if (isHidden) {
        this.rootElement.classList.remove('card-visible')
        this.rootElement.classList.add('card-hidden')
      } else {
        this.rootElement.classList.remove('card-hidden')
        this.rootElement.classList.add('card-visible')
      }
    }
  }

  setHasError(hasError) {
    if (this.hasError != hasError) {
      this.hasError = hasError
      if (hasError) {
        this.titleElement.classList.remove('cardtitle-normal')
        this.titleElement.classList.add('cardtitle-error')
      } else {
        this.titleElement.classList.remove('cardtitle-error')
        this.titleElement.classList.add('cardtitle-normal')
      }
    }
  }

  createGraphChart() {
    if (this.graph) {
      this.graph.createChart();
    }
  }
}

class Dashboard {
  constructor() {
    statusbar.innerText += "Dashboard ctor\n";

    this.rootElement = document.getElementById('dashboard')
    this.cards = []
    setInterval(this.getCurrentData.bind(this), 5000)
    this.getCurrentData()
    statusbar.innerText += "Dashboard ctor done\n";

    this.isSingleView = false;    
  }

  setIsSingleView(isSingle) {
    if (this.isSingleView != isSingle) {
      this.isSingleView = isSingle;
      if (isSingle) {
        this.rootElement.classList.remove('dashboard-tileview');
        this.rootElement.classList.add('dashboard-singleview');
      } else {
        this.rootElement.classList.remove('dashboard-singleview');
        this.rootElement.classList.add('dashboard-tileview');
      }
    }
  }

  getCurrentData() {
    let xhr = new XMLHttpRequest()
    xhr.addEventListener('load', function(evt) {
      if (xhr.status == 200) {
        try {
          let data = JSON.parse(xhr.responseText)
          data.date = new Date(data.date)
          this.appendData(data)
        } catch (error) {
          console.log('> Could not parse data', error)
          statusbar.innerText += error
          this.appendData(null)
        }
      } else {
        console.log('> No valid response')
        statusbar.innerText += 'No valid response'
        this.appendData(null)
      }      
    }.bind(this))

    xhr.addEventListener('error', function(evt) {
      this.appendData(null)
    }.bind(this))

    xhr.open('GET', '/api/currentData')
    xhr.send()
  }

  appendData(data) {
    this.cards.forEach(c => c.appendData(data))
  }

  addCard(dashboardCard) {
    this.cards.push(dashboardCard)
    this.rootElement.appendChild(dashboardCard.rootElement)
    dashboardCard.createGraphChart()
    dashboardCard.rootElement.addEventListener('click', this.cardOnClick.bind(this))
  }

  cardOnClick (evt) {
    // look for the root element of the card clicked
    let el = evt.target
      while (el && !el.classList.contains('card')) {
        el = el.parentNode;
      }
      if (el && el.id) {
        // find the matching card
        let card = this.cards.find(c => c.cardId === el.id);
        if (card) {          
          this.cards.forEach(c => {
            if (c !== card) c.setIsHidden(!c.isHidden)
          })
        }
        this.setIsSingleView(!this.isSingleView)
      }
    }
};

statusbar.innerText += "Starting\n"
Chart.defaults.global.responsive = true
Chart.defaults.global.maintainAspectRatio = true

var dashboard = new Dashboard()

let temperatureGraph = new CardGraph("tempgraph", "Temperature graph")
let humidityGraph = new CardGraph("relhumiditygraph", "Relative humidity graph")

var temp = new DashboardCard('temp', 'Temperature', '/images/temperature_128x128.png', '°C', temperatureGraph);
var relhumidity = new DashboardCard('relhumidity', 'Rel. Humidity', '/images/relhumidity_128x128.png', '%', humidityGraph);

dashboard.addCard(temp);
dashboard.addCard(relhumidity);

dashboard.addCard(new DashboardCard('t1', 'T1', '/images/data_128x128.png', 'Units'));
dashboard.addCard(new DashboardCard('t2', 'T2', '/images/data_128x128.png'));
//dashboard.addCard(new DashboardCard('t3', 'T3', '/images/data_128x128.png', 'U'));
//dashboard.addCard(new DashboardCard('t4', 'T4', '/images/data_128x128.png', 'U'));

