/* eslint-disable no-unused-vars */
/* globals CARDS_IN_HAND, payouts, handTypes, calculateProbabilities */

/**
 * Get HTML elements already created in index.html and store as globals
 */

const audio = document.getElementById('audio');
const muteButton = document.getElementById('mute-button');
const betAudio = document.getElementById('bet-audio');
betAudio.volume = 0.1;
betAudio.playbackRate = 2;
const winAudio = document.getElementById('win-audio');
winAudio.volume = 0.2;
winAudio.playbackRate = 1.5;

const payoutTable = document.querySelector('table tbody');
const cardContainer = document.getElementById('card-container');

const betLabel = document.getElementById('bet-label');
const output = document.getElementById('output-label');
const numCreditsLabel = document.getElementById('credits-label');

const betOneButton = document.getElementById('bet-one');
const betMaxButton = document.getElementById('bet-max');
const dealButton = document.getElementById('deal-button');

/**
 * Populate table
 */
let data;
for (let i = 0; i < handTypes.length; i += 1) {
  const newRow = payoutTable.insertRow();
  const payout = payouts[handTypes[i]];
  data = [handTypes[i].toUpperCase(), payout, '-'];
  for (let j = 0; j < data.length; j += 1) {
    const newCell = newRow.insertCell();
    newCell.appendChild(document.createTextNode(data[j]));
  }
}

/**
 * Clear all table colors
 */
const clearTableColors = () => {
  const normalCells = document.querySelectorAll('table tbody td');
  normalCells.forEach((cell) => cell.classList.remove('table-active', 'flash'));
};

/**
 * Update the probability column
 * @param {Array} probArr - Probability values to update
 */
const updateTableProbabilities = (probArr) => {
  const probabilityCells = document.querySelectorAll('table tbody td:nth-child(3)');
  probabilityCells.forEach((cell, index) => { cell.innerText = probArr[index]; });
};

/**
 * Update the payout column based on the bet size
 * @param {number} bet
 */
const updateTablePayouts = (bet) => {
  const payoutCells = document.querySelectorAll('table tbody td:nth-child(2)');
  payoutCells.forEach((cell, index) => { cell.innerText = payouts[handTypes[index]] * bet; });
};

/**
 * Create a flashing effect when a player wins the hand
 * @param {number} row - The row num to flash
 */
const createTableFlashEffect = (row) => {
  const handTypeCells = document.querySelectorAll(`table tbody tr:nth-child(${row}) td`);
  handTypeCells.forEach((cell) => cell.classList.add('table-active', 'flash'));
};

/**
 * Used when user already has a particular hand type before swapping, highlight the hand type
 * @param {number} row - The row num to highlight
 */
const highlightTableHandType = (row) => {
  const handTypeCell = document.querySelector(`table tbody tr:nth-child(${row}) td:nth-child(1)`);
  handTypeCell.classList.add('table-active');
};

/**
 * Called whenever a card is clicked, when user is deciding what cards to hold
 * @param {HTMLDivElement} cardElement - The HTML element of the card clicked
 * @param {number} index - The index of the card clicked
 */
const cardClick = (cardElement, index, playerHand, curDeck) => {
  // Set the clicked property of the card
  playerHand[index].keep = !playerHand[index].keep;

  const keptCards = playerHand.filter((card) => card.keep);
  const probabilities = calculateProbabilities(curDeck, keptCards);
  updateTableProbabilities(probabilities);

  // Use clicked property to apply styling to the element and change indexes to swap
  if (playerHand[index].keep) cardElement.classList.add('hold');
  else cardElement.classList.remove('hold');
};

/**
 * Creates a fresh set of 5 face-up card elements and adds them to the card container
 * @param {Array} playerHand - Array of card objects
 * @param {boolean} canClick - Can cards be clicked or not
 */
const createFaceUpCardsUI = (playerHand, canClick = false, curDeck = null) => {
  cardContainer.innerHTML = ''; // clear the card container
  for (let i = 0; i < CARDS_IN_HAND; i += 1) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');

    // show cards face up
    cardElement.classList.add('face-up');
    const suit = document.createElement('div');
    suit.classList.add('suit', playerHand[i].colour);
    suit.innerText = playerHand[i].suit;

    const name = document.createElement('div');
    name.classList.add('name', playerHand[i].colour);
    name.innerText = playerHand[i].name;

    cardElement.appendChild(name);
    cardElement.appendChild(suit);

    // if user intends to swap this card, then add animation effect for when it appears
    if (!playerHand[i].keep) cardElement.classList.add('draw-swap');

    if (canClick) {
      // if the card is clickable i.e. before swapping
      // add a cursor effect on hover and add event listener for clicks
      cardElement.classList.add('card-hover');
      cardElement.addEventListener('click', (e) => {
        cardClick(e.currentTarget, i, playerHand, curDeck);
      });
    } else {
      // not clickable i.e. after swapping
      // add this rule to set opacity of all cards to 1 when it appears
      cardElement.classList.add('hold');
    }
    cardContainer.appendChild(cardElement);
  }
};

/**
 * Creates a fresh set of 5 face-down card elements and adds them to the card container
 * @param {boolean} isIdle - If user is idle, add animation to the cards for a 'waiting' screen
 */
const createFaceDownCardsUI = (isIdle) => {
  cardContainer.innerHTML = ''; // clear the card container
  for (let i = 0; i < CARDS_IN_HAND; i += 1) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');

    // show cards face down
    cardElement.classList.add('face-down');
    if (isIdle) {
      cardElement.classList.add('first-load');
    }
    cardContainer.appendChild(cardElement);
  }
};

/**
 * Resets the state of the UI after every hand
 * @param {number} credits
 */
const resetUI = (credits) => {
  dealButton.innerText = 'DEAL';
  betLabel.innerText = 'BET 0';
  if (credits > 0) {
    betOneButton.disabled = false;
    betMaxButton.disabled = false;
  }
  dealButton.disabled = true;
};

/**
 * Only called once when the user clicks on the page for the first time
 */
const playMusic = () => {
  muteButton.style.display = 'inline-block';
  audio.volume = 0.1;
  audio.play();
  document.removeEventListener('click', playMusic);
};

/**
 * Event listeners
 */

document.addEventListener('click', playMusic);

muteButton.addEventListener('click', () => {
  audio.muted = !audio.muted;
  betAudio.muted = !betAudio.muted;
  winAudio.muted = !winAudio.muted;
  if (audio.muted) {
    muteButton.classList.add('fa-volume-mute');
    muteButton.classList.remove('fa-volume-up');
  } else {
    muteButton.classList.add('fa-volume-up');
    muteButton.classList.remove('fa-volume-mute');
  }
});
