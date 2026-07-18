

//images
const SYMBOLS = ["images/evilclown.png", "images/pumpkin.png", "images/ballon.png"];

// Helper function to render a images in a reel. Supports both image URLs/paths and text/emojis.
function setReelSymbol(reel, symbol) {
  const isImage = symbol.includes(".") || symbol.includes("/") || symbol.startsWith("data:");
  if (isImage) {
    reel.innerHTML = `<img src="${symbol}" class="reel-image" alt="symbol" />`;
  } else {
    reel.textContent = symbol;
  }
}

const STARTING_CREDITS = 100;
const DEFAULT_BET = 10;
const BET_STEP = 10;
const MAX_BET = 100;
const SPIN_DURATION = 3000;
const JACKPOT_CHANCE = 0.05;

const ui = {
  credits: document.getElementById("credits"),
  bet: document.getElementById("bet"),
  win: document.getElementById("winAmount"),
  message: document.getElementById("gameMessage"),
  reels: [...document.querySelectorAll(".reel")],
  stage: document.getElementById("reelStage"),
  machine: document.querySelector(".slot-machine"),
  confetti: document.getElementById("confetti"),
  spin: document.getElementById("spinButton"),
  plus: document.getElementById("betPlus"),
  minus: document.getElementById("betMinus"),
  reset: document.getElementById("resetButton")
};

// Start with the initial bet already deducted from player's starting credits
let credits = STARTING_CREDITS - DEFAULT_BET;
let bet = DEFAULT_BET;
let spinning = false;

// Sound effects configuration.
// To add audio: replace null with new Audio("sounds/your-file.mp3")
const sounds = {
  spin:    new Audio("sounds/spin.mpeg"),
  win:     new Audio("sounds/reap.mpeg"),
  jackpot: new Audio("sounds/first.mpeg"),
  lose:    new Audio("sounds/take.mpeg"),
  bet:     new Audio("sounds/coin.mpeg"),
  reset:   new Audio("sounds/corpse.mpeg"),
  bgm:     new Audio("sounds/bgm.mp3")
};

// BGM constants and audio ducking configuration
const NORMAL_BGM_VOLUME = 0.3;
const DUCKED_BGM_VOLUME = 0.05;
const activeSFX = new Set();
let volumeInterval = null;

// Loop background music and set initial volume level
if (sounds.bgm) {
  sounds.bgm.loop = true;
  sounds.bgm.volume = NORMAL_BGM_VOLUME;
}

// Fade BGM volume smoothly to target volume over the specified duration (ms)
function fadeBGMVolume(targetVolume, duration = 400) {
  if (!sounds.bgm) return;
  if (volumeInterval) {
    clearInterval(volumeInterval);
  }

  const startVolume = sounds.bgm.volume;
  const volumeDiff = targetVolume - startVolume;
  if (volumeDiff === 0) return;

  const startTime = performance.now();

  volumeInterval = setInterval(() => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth transition using cosine easing
    const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
    sounds.bgm.volume = startVolume + volumeDiff * easeProgress;

    if (progress >= 1) {
      clearInterval(volumeInterval);
      volumeInterval = null;
    }
  }, 16);
}

// Update BGM volume depending on whether slot is spinning or any sound effect is playing
function updateBGMVolume() {
  const target = (spinning || activeSFX.size > 0) ? DUCKED_BGM_VOLUME : NORMAL_BGM_VOLUME;
  fadeBGMVolume(target);
}

// Wrapper function to play sound effects while tracking active SFX for ducking
function playSFX(audio) {
  if (!audio) return;

  if (!audio.hasDuckListener) {
    audio.addEventListener("ended", () => {
      activeSFX.delete(audio);
      updateBGMVolume();
    });
    audio.addEventListener("pause", () => {
      activeSFX.delete(audio);
      updateBGMVolume();
    });
    audio.hasDuckListener = true;
  }

  audio.currentTime = 0;
  activeSFX.add(audio);
  updateBGMVolume();

  audio.play().catch(e => {
    console.log("SFX play error:", e);
    activeSFX.delete(audio);
    updateBGMVolume();
  });
}

// Start BGM on first user interaction (to comply with browser autoplay policies)
let bgmStarted = false;
function startBGM() {
  if (!bgmStarted && sounds.bgm) {
    sounds.bgm.play().then(() => {
      bgmStarted = true;
      updateBGMVolume();
    }).catch(e => {
      console.log("BGM autoplay waiting for interaction:", e);
    });
  }
}

const randomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

function setMessage(message) {
  ui.message.textContent = message;
}

function animateNumber(element, value) {
  const start = Number(element.textContent) || 0;
  const started = performance.now();
  const duration = 330;
  function frame(now) {
    const progress = Math.min((now - started) / duration, 1);
    element.textContent = Math.round(start + (value - start) * progress);
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function updateUI() {
  animateNumber(ui.credits, credits);
  animateNumber(ui.bet, bet);
  
  // Disable bet controls when spinning or when credits/bet limit is reached
  ui.plus.disabled = spinning || credits < BET_STEP || bet + BET_STEP > MAX_BET;
  ui.minus.disabled = spinning || bet <= BET_STEP;
  
  // Disable spin button when spinning or when player is out of credits and bet
  ui.spin.disabled = spinning || (credits === 0 && bet === 0);
}

function createConfetti() {
  const colors = ["#ffd700", "#fff2a8", "#e21b23", "#7d29aa", "#3fbd73"];
  ui.confetti.replaceChildren();
  for (let i = 0; i < 44; i++) {
    const piece = document.createElement("i");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty("--c", colors[i % colors.length]);
    piece.style.setProperty("--x", `${(Math.random() - .5) * 260}px`);
    piece.style.setProperty("--r", `${Math.random() * 180}deg`);
    piece.style.setProperty("--d", `${1.5 + Math.random() * 1.4}s`);
    ui.confetti.append(piece);
  }
  setTimeout(() => ui.confetti.replaceChildren(), 3200);
}

function calculateResult(finalSymbols, jackpot) {
  const matches = new Set(finalSymbols).size;
  if (jackpot) return { amount: bet * 10, message: "Every prize has a curse.", winner: true };
  if (matches === 1) return { amount: bet * 5, message: "Survival is your reward.", winner: true };
  if (matches === 2) return { amount: bet * 2, message: "You reap what you sow.", winner: true };
  return { amount: 0, message: "Take a deep breath.", winner: false };
}

function animateReels(finalSymbols) {
  ui.reels.forEach(reel => reel.classList.add("spinning"));
  const interval = setInterval(() => ui.reels.forEach(reel => setReelSymbol(reel, randomSymbol())), 80);
  setTimeout(() => {
    clearInterval(interval);
    ui.reels.forEach((reel, index) => {
      setReelSymbol(reel, finalSymbols[index]);
      reel.classList.remove("spinning");
    });
    
    if (sounds.spin) {
      sounds.spin.pause();
    }
    
    finishSpin(finalSymbols);
  }, SPIN_DURATION);
}

function finishSpin(finalSymbols) {
  const result = calculateResult(finalSymbols, finalSymbols.jackpot);
  credits += result.amount;
  animateNumber(ui.win, result.amount);
  setMessage(result.message);
  
  ui.machine.classList.remove("winner", "loser");
  void ui.machine.offsetWidth;
  ui.machine.classList.add(result.winner ? "winner" : "loser");
  
  if (result.winner) {
    createConfetti();
    // A jackpot is achieved if the random jackpot chance triggers or all three symbols match
    const isJackpot = finalSymbols.jackpot || new Set(finalSymbols).size === 1;
    if (isJackpot) {
      playSFX(sounds.jackpot);
    } else {
      playSFX(sounds.win);
    }
  } else {
    playSFX(sounds.lose);
  }
  
  spinning = false;
  updateBGMVolume();
  
  // Commit the bet stake for the next spin
  if (credits >= bet) {
    credits -= bet;
  } else {
    // Reduce bet size to the maximum affordable amount
    const affordableSteps = Math.floor(credits / BET_STEP);
    if (affordableSteps > 0) {
      bet = affordableSteps * BET_STEP;
      credits -= bet;
    } else {
      bet = 0;
      credits = 0;
      setMessage("Game Over! Your last breath is mine.");
    }
  }
  
  updateUI();
}

function spin() {
  if (spinning || (credits === 0 && bet === 0)) return;
  startBGM();
  
  spinning = true;
  updateBGMVolume();
  animateNumber(ui.win, 0);
  setMessage("The reels are whirling through the mist...");
  updateUI();
  
  playSFX(sounds.spin);
  
  const jackpot = Math.random() < JACKPOT_CHANCE;
  const finalSymbols = jackpot ? Array(3).fill(randomSymbol()) : Array.from({ length: 3 }, randomSymbol);
  finalSymbols.jackpot = jackpot;
  animateReels(finalSymbols);
}

function changeBet(direction) {
  if (spinning) return;
  startBGM();
  
  if (direction === 1) {
    // Bet Plus: increase bet by step and deduct immediately from credits
    if (credits >= BET_STEP && bet + BET_STEP <= MAX_BET) {
      bet += BET_STEP;
      credits -= BET_STEP;
      playSFX(sounds.bet);
      updateUI();
    }
  } else if (direction === -1) {
    // Bet Minus: decrease bet by step and return those credits immediately
    if (bet > BET_STEP) {
      bet -= BET_STEP;
      credits += BET_STEP;
      playSFX(sounds.bet);
      updateUI();
    }
  }
}

function resetGame() {
  startBGM();
  credits = STARTING_CREDITS - DEFAULT_BET;
  bet = DEFAULT_BET;
  spinning = false;
  updateBGMVolume();
  
  ui.reels.forEach((reel, i) => setReelSymbol(reel, SYMBOLS[i]));
  ui.machine.classList.remove("winner", "loser");
  ui.confetti.replaceChildren();
  
  animateNumber(ui.win, 0);
  setMessage("The game starts now. You're a corpse already.");
  
  playSFX(sounds.reset);
  
  updateUI();
}

ui.spin.addEventListener("click", spin);
ui.plus.addEventListener("click", () => changeBet(1));
ui.minus.addEventListener("click", () => changeBet(-1));
ui.reset.addEventListener("click", resetGame);

// Initialize reels with initial symbols on page load
ui.reels.forEach((reel, i) => setReelSymbol(reel, SYMBOLS[i]));
updateUI();
