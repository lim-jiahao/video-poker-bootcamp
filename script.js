let deck = [];
let hand = [];
let credits = 100;
let indexesToSwap = [0, 1, 2, 3, 4];
let bet = 0;
let handInProgress = false;

const payouts = {
  'Royal Flush': 800,
  'Straight Flush': 50,
  'Four of a Kind': 25,
  'Full House': 9,
  Flush: 6,
  Straight: 4,
  'Three of a Kind': 3,
  'Two Pair': 2,
  'Jacks or Better': 1,
};

const audio = document.getElementById('audio');
const muteButton = document.createElement('button');
muteButton.innerText = 'MUTE';
document.body.appendChild(muteButton);

const container = document.getElementById('container');
const payoutTable = document.createElement('table');
container.appendChild(payoutTable);

const cardDiv = document.createElement('div');
cardDiv.id = 'card-container';
container.appendChild(cardDiv);

const gameInfo = document.createElement('div');
gameInfo.id = 'game-info';
container.appendChild(gameInfo);

const output = document.createElement('p');
output.classList.add('game-output', 'blink');
output.innerText = 'Insert credits to play';
gameInfo.appendChild(output);

const betLabel = document.createElement('p');
betLabel.classList.add('bet-label');
betLabel.innerText = `Bet: ${bet}`;
gameInfo.appendChild(betLabel);

const numCreditsLabel = document.createElement('p');
numCreditsLabel.classList.add('credits-label');
numCreditsLabel.innerText = `Credits: ${credits}`;
gameInfo.appendChild(numCreditsLabel);

const buttonContainer = document.createElement('div');
buttonContainer.id = 'button-container';
container.appendChild(buttonContainer);

const betOneButton = document.createElement('button');
betOneButton.classList.add('bet-button');
betOneButton.innerText = 'BET ONE';
buttonContainer.appendChild(betOneButton);

const betMaxButton = document.createElement('button');
betMaxButton.classList.add('bet-button');
betMaxButton.innerText = 'BET MAX';
buttonContainer.appendChild(betMaxButton);

const dealButton = document.createElement('button');
dealButton.id = 'deal-button';
dealButton.innerText = 'DRAW';
dealButton.disabled = true;
buttonContainer.appendChild(dealButton);

// Get a random index ranging from 0 (inclusive) to max (exclusive).
const getRandomIndex = (max) => Math.floor(Math.random() * max);

const generateCard = (cardRank, suit) => {
  const symbols = ['♥', '♦', '♣', '♠'];
  let cardName = '';
  switch (cardRank) {
    case 1:
      cardName = 'A';
      break;
    case 11:
      cardName = 'J';
      break;
    case 12:
      cardName = 'Q';
      break;
    case 13:
      cardName = 'K';
      break;
    default:
      cardName = cardRank;
  }

  const card = {
    suit: symbols[suit],
    name: cardName,
    colour: suit < 2 ? 'red' : 'black',
    rank: cardRank,
    clicked: false,
  };
  return card;
};

// generate the deck for gameplay
const makeDeck = () => {
  for (let i = 1; i <= 13; i += 1) {
    for (let j = 0; j < 4; j += 1) {
      // generates cards and inserts randomly to get a 52-card deck
      deck.splice(getRandomIndex(deck.length + 1), 0, generateCard(i, j));
    }
  }
};

const resetGame = () => {
  hand = [];
  deck = [];
  bet = 0;
  indexesToSwap = [0, 1, 2, 3, 4];

  dealButton.innerText = 'Deal';
  betLabel.innerText = `Bet: ${bet}`;
  betOneButton.disabled = false;
  betMaxButton.disabled = false;
  dealButton.disabled = true;
  const normalCells = document.querySelectorAll('table td');
  normalCells.forEach((cell) => cell.classList.remove('table-active'));
};

const getSortedRanks = (cards) => cards.map((card) => card.rank).sort((a, b) => a - b);

const getSuits = (cards) => cards.map((card) => card.suit);

const count = (arr, item) => arr.filter((ele) => ele === item).length;

const set = (arr) => new Set(arr);

const isFlush = (suits) => set(suits).size === 1;

const isStraight = (ranks) => {
  const straights = [
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6],
    [3, 4, 5, 6, 7],
    [4, 5, 6, 7, 8],
    [5, 6, 7, 8, 9],
    [6, 7, 8, 9, 10],
    [7, 8, 9, 10, 11],
    [8, 9, 10, 11, 12],
    [9, 10, 11, 12, 13],
    [1, 10, 11, 12, 13],
  ];

  for (let i = 0; i < straights.length; i += 1) {
    if (ranks.every((ele, index) => straights[i][index] === ele)) return true;
  }

  return false;
};

const isRoyalFlush = (ranks, suits) => {
  const tenToAce = [1, 10, 11, 12, 13];
  return isFlush(suits) && ranks.every((ele, index) => tenToAce[index] === ele);
};

const isStraightFlush = (ranks, suits) => isStraight(ranks) && isFlush(suits);

const isQuads = (ranks) => ranks.some((rank) => count(ranks, rank) === 4);

const isFullHouse = (ranks) => {
  const tripsPresent = ranks.some((rank) => count(ranks, rank) === 3);
  return set(ranks).size === 2 && tripsPresent;
};

const isTrips = (ranks) => {
  const tripsPresent = ranks.some((rank) => count(ranks, rank) === 3);
  return set(ranks).size === 3 && tripsPresent;
};

const isTwoPair = (ranks) => {
  const pairPresent = ranks.some((rank) => count(ranks, rank) === 2);
  return set(ranks).size === 3 && pairPresent;
};

const isJacksOrBetterPair = (ranks) => {
  const pair = ranks.filter((rank) => count(ranks, rank) === 2);
  const jacksOrBetterRanks = [1, 11, 12, 13];
  return pair.length !== 0 && jacksOrBetterRanks.includes(pair[0]);
};

const determineHandType = (cards) => {
  const ranks = getSortedRanks(cards);
  const suits = getSuits(cards);
  const handTypes = Object.keys(payouts);

  if (isRoyalFlush(ranks, suits)) return handTypes[0];
  if (isStraightFlush(ranks, suits)) return handTypes[1];
  if (isQuads(ranks)) return handTypes[2];
  if (isFullHouse(ranks)) return handTypes[3];
  if (isFlush(suits)) return handTypes[4];
  if (isStraight(ranks)) return handTypes[5];
  if (isTrips(ranks)) return handTypes[6];
  if (isTwoPair(ranks)) return handTypes[7];
  if (isJacksOrBetterPair(ranks)) return handTypes[8];

  return null;
};

const cardClick = (cardElement, index) => {
  hand[index].clicked = !hand[index].clicked;

  if (hand[index].clicked) {
    cardElement.classList.add('clicked');
    indexesToSwap = indexesToSwap.filter((ele) => ele !== index);
  } else {
    cardElement.classList.remove('clicked');
    indexesToSwap.push(index);
  }
};

const createCardUI = (faceDown = true, canClick = true) => {
  cardDiv.innerHTML = '';
  for (let i = 0; i < 5; i += 1) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');

    if (!faceDown) {
      cardElement.classList.add('face-up');
      const suit = document.createElement('div');
      suit.classList.add('suit', hand[i].colour);
      suit.innerText = hand[i].suit;

      const name = document.createElement('div');
      name.classList.add('name', hand[i].colour);
      name.innerText = hand[i].name;

      cardElement.appendChild(name);
      cardElement.appendChild(suit);

      if (canClick) {
        cardElement.addEventListener('click', (e) => {
          cardClick(e.currentTarget, i);
        });
      }
    } else {
      cardElement.classList.add('face-down');
    }
    cardDiv.appendChild(cardElement);
  }
};

const swapCards = () => {
  for (let i = 0; i < indexesToSwap.length; i += 1) {
    const index = indexesToSwap[i];
    hand[index] = deck.pop();
  }
  createCardUI(false, false);
  const handType = determineHandType(hand);
  let outputMsg = '';
  if (handType in payouts) {
    credits += bet * payouts[handType];
    outputMsg = `${handType}! Play again?`;
  } else {
    outputMsg = 'Nothing at all! Play again?';
  }

  numCreditsLabel.innerText = `Credits: ${credits}`;
  output.innerText = outputMsg;

  setTimeout(() => {
    if (handInProgress) {
      output.innerText = 'Insert credits to play';
      output.classList.add('blink');
    }
  }, 5000);
  resetGame();
};

const dealHand = () => {
  makeDeck();
  handInProgress = true;

  for (let i = 0; i < 5; i += 1) {
    const card = deck.pop();
    hand.push(card);
  }
  createCardUI(false);
  const handType = determineHandType(hand);
  if (handType) output.innerText = `${handType}`;
  else output.innerText = '';

  betOneButton.disabled = true;
  betMaxButton.disabled = true;
  dealButton.innerText = 'Swap';
};

const createPayoutTable = () => {
  const handTypes = Object.keys(payouts);
  let data;

  for (let i = 0; i < handTypes.length; i += 1) {
    const newRow = payoutTable.insertRow();
    const payout = payouts[handTypes[i]];
    data = [handTypes[i].toUpperCase(), payout, payout * 2, payout * 3, payout * 4, payout * 5];
    for (let j = 0; j < data.length; j += 1) {
      const newCell = newRow.insertCell();
      newCell.appendChild(document.createTextNode(data[j]));
    }
  }
};

betOneButton.addEventListener('click', () => {
  if (handInProgress) {
    handInProgress = false;
    createCardUI();
  }
  output.classList.remove('blink');
  output.innerText = 'Good luck!';

  if (bet < 5) {
    bet += 1;
    credits -= 1;
    betLabel.innerText = `Bet: ${bet}`;
    numCreditsLabel.innerText = `Credits: ${credits}`;
    const highlightCells = document.querySelectorAll(`table td:nth-child(${bet + 1})`);
    highlightCells.forEach((cell) => cell.classList.add('table-active'));
    const normalCells = document.querySelectorAll(`table td:not(:nth-child(${bet + 1}))`);
    normalCells.forEach((cell) => cell.classList.remove('table-active'));
    dealButton.disabled = false;
    if (bet === 5) {
      betOneButton.disabled = true;
      betMaxButton.disabled = true;
    }
  }
});

betMaxButton.addEventListener('click', () => {
  if (handInProgress) {
    handInProgress = false;
    createCardUI();
  }
  output.classList.remove('blink');
  output.innerText = 'Good luck!';

  const total = bet + credits;
  bet = 5;
  credits = total - bet;
  betLabel.innerText = `Bet: ${bet}`;
  numCreditsLabel.innerText = `Credits: ${credits}`;
  const highlightCells = document.querySelectorAll(`table td:nth-child(${bet + 1})`);
  highlightCells.forEach((cell) => cell.classList.add('table-active'));
  const normalCells = document.querySelectorAll(`table td:not(:nth-child(${bet + 1}))`);
  normalCells.forEach((cell) => cell.classList.remove('table-active'));
  betOneButton.disabled = true;
  betMaxButton.disabled = true;
  dealButton.disabled = false;
});

dealButton.addEventListener('click', () => {
  if (!handInProgress) dealHand();
  else swapCards();
});

const playMusic = () => {
  audio.volume = 0.1;
  audio.play();
  document.removeEventListener('click', playMusic);
};

createCardUI();
createPayoutTable();
document.addEventListener('click', playMusic);
muteButton.addEventListener('click', () => {
  audio.muted = !audio.muted;
});
