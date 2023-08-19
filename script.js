class App {
  #map;
  #currentCoords;
  #zoomLevel = 13;
  constructor() {
    this._getCurrentLocation();
  }
  _getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const crd = pos.coords;

        this._renderMap(crd);
      },
      (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
      }
    );
  }

  _renderMap(crd) {
    const lat = crd.latitude;
    const lng = crd.longitude;

    const coords = [lat, lng];

    this.#map = L.map('map').setView(coords, this.#zoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
  }
}

const app = new App();
