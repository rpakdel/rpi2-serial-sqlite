class DashboardCard {
  constructor(id, title, iconSrc, units) {
    this.id = id;
    this.title = title;
    this.iconSrc = iconSrc;
    this.units = units;    
    this.valueElement = null;
    this.dateUpdated = null;
  }

  createElement() {
    // root element
    let root = document.createElement('div')
    root.id = this.id
    root.classList.add('card')

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
    valueContainer.appendChild(this.valueElement)

    // units
    let unitsEl = document.createElement('span')
    unitsEl.classList.add('units')
    unitsEl.innerText = this.units
    valueContainer.appendChild(unitsEl)

    return root;
  }

  setData(data) {
    let value = data[this.id]
    if (value) {
        this.valueElement.innerText = value
        this.dateUpdated = data.date
    }
  }
}

class Dashboard {
  constructor() {
    //this.tempEL = document.getElementById('temperature')
    //this.relhumidEl = document.getElementById('relhumidity')
    this.root = document.getElementById('dashboard')
    this.cards = [];
    setInterval(this.getCurrentData.bind(this), 5000)
    this.getCurrentData()
  }

  getCurrentData() {
    fetch('/api/currentData', {
      method: 'GET',      
    })
    .then(response => {
      if (response.ok) {
        response.json().then(data => {
          this.cards.forEach(c => c.setData(data))          
        })
        .catch(err => console.log(err))
      }
    })
    .catch(err => console.log(err))
  }

  addCard(dashboardCard) {
    this.cards.push(dashboardCard)
    let cardEl = dashboardCard.createElement()
    this.root.appendChild(cardEl)
  }
};

const dashboard = new Dashboard()

const temp = new DashboardCard('temp', 'Temperature', '/images/temperature.svg', 'C')
const relhumidity = new DashboardCard('relhumidity', 'Rel. Humidity', '/images/humidity.svg', '%')

dashboard.addCard(temp)
dashboard.addCard(relhumidity)