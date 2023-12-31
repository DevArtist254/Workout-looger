class Workout {
  id = Math.floor(Math.random() * 1000);
  date = new Date().getDate();
  month = new Date().getMonth();
  hours = new Date().getHours();
  minutes = new Date().getMinutes();

  constructor(selectedlatlng, distance, duration) {
    this.selectedlatlng = selectedlatlng;
    this.distance = distance;
    this.duration = duration;
  }

  description() {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    this.description = `on ${this.date}/${months[this.month]} at ${
      this.hours
    }:${this.minutes}`;
  }

  speed() {
    this.speed = this.distance / this.duration;
  }
}

class Running extends Workout {
  constructor(selectedlatlng, distance, duration, typed, cadence) {
    super(selectedlatlng, distance, duration);
    this.typed = typed;
    this.cadence = cadence;
    this.description();
    this.speed();
  }
}

class Cycling extends Workout {
  constructor(selectedlatlng, distance, duration, typed, elevation) {
    super(selectedlatlng, distance, duration);
    this.typed = typed;
    this.elevation = elevation;
    this.description();
    this.speed();
  }
}

const workoutSelector = document.getElementById('type-selecting');
const cadenceArea = document.querySelector('.cadence');
const elevArea = document.querySelector('.elevation');
const workoutsArea = document.querySelector('.workouts');
const mapArea = document.querySelector('#map');

const form = document.getElementById('form');
const durationInput = document.getElementById('durationInput');
const distanceInput = document.getElementById('distanceInput');
const cadenceInput = document.getElementById('cadenceInput');
const elevationInput = document.getElementById('elevationInput');

class App {
  #selectedWorkout = 'cycling';
  #map;
  #selectedCoords;
  #zoomLevel = 13;
  #workouts = [];
  constructor() {
    this._getCurrentLocation();

    this._initLocalStorage();

    form.addEventListener('submit', this._workoutLogger.bind(this));

    workoutSelector.addEventListener(
      'change',
      this._toggleBtwnRunningCycling.bind(this)
    );
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

    this.#map.on('click', this._showForm.bind(this));

    if (!this.#workouts) return;

    this.#workouts.forEach((workout) => {
      this._renderWorkoutMarker(workout);
    });
  }

  _showForm(e) {
    const {lat, lng} = e.latlng;

    this.#selectedCoords = [lat, lng];
    form.classList.remove('formHidden');
  }

  _workoutLogger(e) {
    function numberChecker(numbers) {
      return numbers.every((number) => Number.isFinite(number));
    }

    e.preventDefault();

    const distance = +distanceInput.value;
    const duration = +durationInput.value;
    let workout;

    if (this.#selectedWorkout === 'cycling') {
      const elevation = +elevationInput.value;
      if (!numberChecker([distance, duration, elevation]))
        return alert('Please enter a number!');

      workout = new Cycling(
        this.#selectedCoords,
        distance,
        duration,
        this.#selectedWorkout,
        elevation
      );
    }

    if (this.#selectedWorkout === 'running') {
      const cadence = +cadenceInput.value;

      if (!numberChecker([distance, duration, cadence]))
        return alert('Please enter a number!');

      workout = new Running(
        this.#selectedCoords,
        distance,
        duration,
        this.#selectedWorkout,
        cadence
      );
    }

    this.#workouts.push(workout);

    this._renderWorkout(workout);

    this._renderWorkoutMarker(workout);

    this._hideForm();

    this._setWorkoutLS();
  }

  _toggleBtwnRunningCycling(e) {
    this.#selectedWorkout = e.target.value;

    if (this.#selectedWorkout === 'cycling') {
      cadenceArea.classList.add('cadenceHidden');
      elevArea.classList.remove('elevHidden');
    } else if (this.#selectedWorkout === 'running') {
      cadenceArea.classList.remove('cadenceHidden');
      elevArea.classList.add('elevHidden');
    }
  }

  _renderWorkout(workout) {
    let html;

    if (workout.typed === 'running') {
      html = `
    <div class="workout bdr-${workout.typed}">
            <div class="workout__title">${workout.typed} on ${
        workout.description
      }</div>
            <div class="workout__details">
              <div class="workout__details--distance">${
                workout.typed === 'cycling' ? `🚴‍♀️` : `🏃‍♂️`
              } ${workout.distance} KM</div>
              <div class="workout__details--duration">🦶🏼 ${
                workout.duration
              } MIN</div>
              <div class="workout__details--speed">⚡️ ${
                workout.speed
              } KM/H</div>
              <div class="workout__details--cadence">⛰ ${
                workout.cadence
              } M</div>
            </div>
          </div>
    `;
    }

    if (workout.typed === 'cycling') {
      html = `
    <div class="workout bdr-${workout.typed}">
            <div class="workout__title">${workout.typed} on ${
        workout.description
      }</div>
            <div class="workout__details">
              <div class="workout__details--distance">${
                workout.typed === 'cycling' ? `🚴‍♀️` : `🏃‍♂️`
              } ${workout.distance} KM</div>
              <div class="workout__details--duration">🦶🏼 ${
                workout.duration
              } MIN</div>
              <div class="workout__details--speed">⚡️ ${
                workout.speed
              } KM/H</div>
              <div class="workout__details--cadence">⛰ ${
                workout.elevation
              } M</div>
            </div>
          </div>
    `;
    }

    workoutsArea.insertAdjacentHTML('beforeend', html);
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.selectedlatlng)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.typed}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'cycling' ? `🚴‍♀️` : `🏃‍♂️`} ${workout.description}`
      )
      .openPopup();
  }

  _hideForm() {
    form.classList.add('formHidden');
  }

  _initLocalStorage() {
    const workoutStored = localStorage.getItem('workouts');

    if (!workoutStored) return;

    this.#workouts = JSON.parse(workoutStored);

    this.#workouts.forEach((workout) => {
      this._renderWorkout(workout);
    });
  }

  _setWorkoutLS() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
}

const app = new App();
