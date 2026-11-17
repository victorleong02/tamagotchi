// 1. STATE: the pet's data lives in one object
function newPet() {
  return {
    hunger: 50,
    happiness: 50,
    energy: 50,
    age: 0, // counts ticks survived
    neglect: 0, // climbs while needs are ignored
    alive: true,
    paused: false,
  };
}

let pet = newPet();

const SICK_AT = 8; // neglect level where the pet gets sick
const DEATH_AT = 20; // neglect level where the pet dies

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
const stageEl = document.getElementById("stage");
const medicineBtn = document.getElementById("medicine-btn");
const restartBtn = document.getElementById("restart-btn");
const pauseBtn = document.getElementById("pause-btn");
const pauseMenu = document.getElementById("pause-menu");
const resumeBtn = document.getElementById("resume-btn");
const pauseRestartBtn = document.getElementById("pause-restart-btn");

// 4. ACTIONS: change the state, then re-render
function feed() {
  if (!pet.alive || pet.paused) return;
  pet.hunger = clamp(pet.hunger - 10);
  render();
}

function play() {
  if (!pet.alive || pet.paused) return;
  pet.happiness = clamp(pet.happiness + 10);
  pet.energy = clamp(pet.energy - 10);
  render();
}

function sleep() {
  if (!pet.alive || pet.paused) return;
  pet.energy = clamp(pet.energy + 20);
  render();
}

// 5. LISTEN: connect buttons to actions
feedBtn.addEventListener("click", feed);
playBtn.addEventListener("click", play);
sleepBtn.addEventListener("click", sleep);

// TIME: every 3 seconds, the pet's needs change on their own
function tick() {
  if (!pet.alive || pet.paused) return;

  pet.hunger = clamp(pet.hunger + 2);
  pet.happiness = clamp(pet.happiness - 1);
  pet.energy = clamp(pet.energy - 1);
  pet.age = pet.age + 1;

  // is the pet being neglected?
  const neglected = pet.hunger >= 90 || pet.happiness <= 10 || pet.energy <= 10;

  if (neglected) {
    pet.neglect = pet.neglect + 1;
  } else {
    pet.neglect = Math.max(0, pet.neglect - 1); // recovers when cared for
  }

  if (pet.neglect >= DEATH_AT) {
    pet.alive = false;
  }

  render();
}

// MOOD: decide how the pet feels based on its stats
const moodEmoji = {
  happy: "🐶",
  hungry: "🥺",
  tired: "😴",
  sad: "😢",
  sick: "🤒",
  dead: "💀",
};

function getMood() {
  if (!pet.alive) return "dead";
  if (pet.neglect >= SICK_AT) return "sick";
  if (pet.hunger > 80) return "hungry";
  if (pet.energy < 20) return "tired";
  if (pet.happiness < 30) return "sad";
  return "happy";
}

setInterval(tick, 500); // every 5 seconds, the pet's needs change on their own

const stageSize = { baby: 60, puppy: 100, adult: 140 };

function getStage() {
  if (pet.age < 10) return "baby";
  if (pet.age < 30) return "puppy";
  return "adult";
}

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

  // stage and life
  petEl.style.fontSize = stageSize[getStage()] + "px";
  stageEl.textContent = pet.alive
    ? "Stage: " + getStage() + " (age " + pet.age + ")"
    : "Game over. It survived " + pet.age + " ticks.";
  restartBtn.hidden = pet.alive;
  // pause menu
  pauseMenu.hidden = !pet.paused;
  pauseBtn.hidden = pet.paused || !pet.alive;
}

function medicine() {
  if (!pet.alive || pet.paused) return;
  pet.neglect = 0;
  render();
}

function restart() {
  pet = newPet();
  render();
}

medicineBtn.addEventListener("click", medicine);
restartBtn.addEventListener("click", restart);

function pause() {
  if (!pet.alive) return;
  pet.paused = true;
  render();
}

function resume() {
  pet.paused = false;
  render();
}

pauseBtn.addEventListener("click", pause);
resumeBtn.addEventListener("click", resume);
pauseRestartBtn.addEventListener("click", restart);

render();
