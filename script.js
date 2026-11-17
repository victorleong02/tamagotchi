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

function save() {
  const data = { pet: pet, savedAt: Date.now() };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function load() {
  try {
    const text = localStorage.getItem(SAVE_KEY);
    if (!text) return; // no save yet, keep the fresh pet

    const data = JSON.parse(text);
    pet = Object.assign(newPet(), data.pet);

    // how many ticks did we miss while away?
    const elapsed = Date.now() - data.savedAt;
    const missed = Math.min(MAX_CATCHUP, Math.floor(elapsed / TICK_MS));

    for (let i = 0; i < missed; i++) {
      applyTick();
    }
  } catch (error) {
    console.log("Could not load save:", error);
    pet = newPet();
  }
}

let pet = newPet();

const SICK_AT = 8; // neglect level where the pet gets sick
const DEATH_AT = 20; // neglect level where the pet dies
const TICK_MS = 1000; // time between ticks (1 second)
const SAVE_KEY = "tamagotchi-save"; // the name our save is stored under
const MAX_CATCHUP = 200; // most ticks we'll replay after being away

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
const gameEl = document.getElementById("game");
const muteBtn = document.getElementById("mute-btn");

// SOUND: tiny beeps made with the Web Audio API
const MUTE_KEY = "tamagotchi-muted";
let muted = localStorage.getItem(MUTE_KEY) === "true";
let audioCtx = null;

function beep(freq, duration) {
  if (muted) return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration,
  );
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// each sound is a list of [frequency, length] notes
const sounds = {
  feed: [
    [500, 0.1],
    [700, 0.15],
  ],
  play: [
    [600, 0.08],
    [800, 0.08],
    [1000, 0.12],
  ],
  sleep: [
    [400, 0.2],
    [300, 0.3],
  ],
  medicine: [
    [700, 0.1],
    [500, 0.1],
    [900, 0.2],
  ],
  death: [
    [300, 0.3],
    [200, 0.3],
    [100, 0.6],
  ],
};

function playSound(name) {
  sounds[name].forEach(function (note, i) {
    setTimeout(function () {
      beep(note[0], note[1]);
    }, i * 120);
  });
}

function toggleMute() {
  muted = !muted;
  localStorage.setItem(MUTE_KEY, muted);
  muteBtn.textContent = muted ? "🔇" : "🔊";
}

muteBtn.textContent = muted ? "🔇" : "🔊";
muteBtn.addEventListener("click", toggleMute);

// 4. ACTIONS: change the state, then re-render
function feed() {
  if (!pet.alive || pet.paused) return;
  pet.hunger = clamp(pet.hunger - 10);
  render();
  react("🍖");
  playSound("feed");
}

function play() {
  if (!pet.alive || pet.paused) return;
  pet.happiness = clamp(pet.happiness + 10);
  pet.energy = clamp(pet.energy - 10);
  render();
  react("❤️");
  playSound("play");
}

function sleep() {
  if (!pet.alive || pet.paused) return;
  pet.energy = clamp(pet.energy + 20);
  render();
  react("💤");
  playSound("sleep");
}

// 5. LISTEN: connect buttons to actions
feedBtn.addEventListener("click", feed);
playBtn.addEventListener("click", play);
sleepBtn.addEventListener("click", sleep);

// TIME: every 3 seconds, the pet's needs change on their own
function applyTick() {
  if (!pet.alive || pet.paused) return;

  pet.hunger = clamp(pet.hunger + 2);
  pet.happiness = clamp(pet.happiness - 1);
  pet.energy = clamp(pet.energy - 1);
  pet.age = pet.age + 1;

  const neglected = pet.hunger >= 90 || pet.happiness <= 10 || pet.energy <= 10;

  if (neglected) {
    pet.neglect = pet.neglect + 1;
  } else {
    pet.neglect = Math.max(0, pet.neglect - 1);
  }

  if (pet.neglect >= DEATH_AT) {
    pet.alive = false;
  }
}

// What the timer calls: change state, then draw
function tick() {
  const wasAlive = pet.alive;
  applyTick();
  render();
  if (wasAlive && !pet.alive) playSound("death");
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

setInterval(tick, TICK_MS);

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
  petEl.dataset.mood = getMood();
  document.title = moodEmoji[getMood()] + " Tamagotchi";

  // stage and life
  petEl.style.fontSize = stageSize[getStage()] + "px";
  stageEl.textContent = pet.alive
    ? "Stage: " + getStage() + " (age " + pet.age + ")"
    : "Game over. It survived " + pet.age + " ticks.";
  restartBtn.hidden = pet.alive;
  // pause menu
  pauseMenu.hidden = !pet.paused;
  pauseBtn.hidden = pet.paused || !pet.alive;
  save();
}

function medicine() {
  if (!pet.alive || pet.paused) return;
  pet.neglect = 0;
  render();
  react("💊");
  playSound("medicine");
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

load();
render();

// REACTION: pop the pet and float an emoji up
function react(emoji) {
  petEl.classList.remove("pop");
  void petEl.offsetWidth; // forces the browser to restart the animation
  petEl.classList.add("pop");

  const floater = document.createElement("div");
  floater.className = "floater";
  floater.textContent = emoji;
  gameEl.appendChild(floater);
  floater.addEventListener("animationend", function () {
    floater.remove();
  });
}
