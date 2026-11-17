// 1. STATE: the pet's data lives in one object
const pet = {
  hunger: 50,
  happiness: 50,
  energy: 50,
};

// 2. FIND the elements on the page
const hungerEl = document.getElementById("hunger");
const happinessEl = document.getElementById("happiness");
const energyEl = document.getElementById("energy");

const feedBtn = document.getElementById("feed-btn");
const playBtn = document.getElementById("play-btn");
const sleepBtn = document.getElementById("sleep-btn");

// 3. RENDER: copy the state onto the screen
function render() {
  hungerEl.textContent = pet.hunger;
  happinessEl.textContent = pet.happiness;
  energyEl.textContent = pet.energy;
}

// 4. ACTIONS: change the state, then re-render
function feed() {
  pet.hunger = pet.hunger - 10;
  render();
}

function play() {
  pet.happiness = pet.happiness + 10;
  pet.energy = pet.energy - 10;
  render();
}

function sleep() {
  pet.energy = pet.energy + 20;
  render();
}

// 5. LISTEN: connect buttons to actions
feedBtn.addEventListener("click", feed);
playBtn.addEventListener("click", play);
sleepBtn.addEventListener("click", sleep);

// Show the starting numbers
render();
