// 1. STATE: the pet's data lives in one object
const pet = {
  hunger: 50,
  happiness: 50,
  energy: 50,
};

// Keeps a number between 0 and 100
function clamp(value) {
  return Math.min(100, Math.max(0, value));
}

// 2. FIND the elements on the page
const hungerEl = document.getElementById("hunger");
const happinessEl = document.getElementById("happiness");
const energyEl = document.getElementById("energy");
const feedBtn = document.getElementById("feed-btn");
const playBtn = document.getElementById("play-btn");
const sleepBtn = document.getElementById("sleep-btn");
const petEl = document.getElementById("pet");
const hungerFill = document.getElementById("hunger-fill");
const happinessFill = document.getElementById("happiness-fill");
const energyFill = document.getElementById("energy-fill");

// 3. RENDER: copy the state onto the screen
function render() {
  hungerEl.textContent = pet.hunger;
  happinessEl.textContent = pet.happiness;
  energyEl.textContent = pet.energy;
}

// 4. ACTIONS: change the state, then re-render
function feed() {
  pet.hunger = clamp(pet.hunger - 10);
  render();
}

function play() {
  pet.happiness = clamp(pet.happiness + 10);
  pet.energy = clamp(pet.energy - 10);
  render();
}

function sleep() {
  pet.energy = clamp(pet.energy + 20);
  render();
}

// 5. LISTEN: connect buttons to actions
feedBtn.addEventListener("click", feed);
playBtn.addEventListener("click", play);
sleepBtn.addEventListener("click", sleep);

// Show the starting numbers
// TIME: every 3 seconds, the pet's needs change on their own
function tick() {
  pet.hunger = clamp(pet.hunger + 2);
  pet.happiness = clamp(pet.happiness - 1);
  pet.energy = clamp(pet.energy - 1);
  render();
}

// MOOD: decide how the pet feels based on its stats
const moodEmoji = {
  happy: "🐶",
  hungry: "🥺",
  tired: "😴",
  sad: "😢",
};

function getMood() {
  if (pet.hunger > 80) return "hungry";
  if (pet.energy < 20) return "tired";
  if (pet.happiness < 30) return "sad";
  return "happy";
}
setInterval(tick, 1000);
function render() {
  // numbers
  hungerEl.textContent = pet.hunger;
  happinessEl.textContent = pet.happiness;
  energyEl.textContent = pet.energy;

  // bars
  hungerFill.style.width = pet.hunger + "%";
  happinessFill.style.width = pet.happiness + "%";
  energyFill.style.width = pet.energy + "%";

  // red when things are bad (for hunger, HIGH is bad)
  hungerFill.classList.toggle("danger", pet.hunger > 70);
  happinessFill.classList.toggle("danger", pet.happiness < 30);
  energyFill.classList.toggle("danger", pet.energy < 30);

  // face
  petEl.textContent = moodEmoji[getMood()];
}
