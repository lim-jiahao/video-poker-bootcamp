/**
 * Global variables, including those from ui-helper and game-utils
 */

let deck = [];
let hand = [];
let handNum = 1;
let credits = 100;
let bet = 0;
let handInProgress = false;

// From ui-helper
/* globals betAudio, winAudio, betLabel, output, numCreditsLabel */
/* globals betOneButton, betMaxButton, dealButton, indexesToSwap */
/* globals createFaceDownCardsUI, createFaceUpCardsUI, setTableEffects, resetUI */

// From game-utils
/* globals MAX_BET, CARDS_IN_HAND, payouts, handTypes, makeDeck, determineHandType */

/**
 * Resets the game
 */
const resetGame = () => {
  hand = [];
  bet = 0;
};

/**
 * Called after the user chooses cards to swap and clicks on 'Draw'
 */
const swapCards = () => {
  for (let i = 0; i < indexesToSwap.length; i += 1) {
    const index = indexesToSwap[i];
    hand[index] = deck.pop();
  }
  createFaceUpCardsUI(hand, false);
};

/**
 * Pays the player after the swap is done
 */
const payoutPlayer = () => {
  const handType = determineHandType(hand);
  let payout = 0;
  const win = handType in payouts;

  setTableEffects('clearAll', null, null);

  if (win) {
    payout = payouts[handType];
    output.innerText = `${handType}! Play again?`;
    winAudio.play();

    const index = handTypes.indexOf(handType);
    setTableEffects('flash', index + 1, bet + 1);
  } else {
    output.innerText = credits > 0 ? 'Nothing at all! Play again?' : 'Nothing at all! No credits left';
  }

  // Make effect to increase credits tgt with flashing table effect
  let counter = 0;
  const intervalLength = payout > 1 ? bet * payout : bet;
  const effect = setInterval(() => {
    if (win) {
      credits += 1;
      numCreditsLabel.innerText = `CREDITS ${credits}`;
    }
    counter += 1;
    if (counter === intervalLength) {
      clearInterval(effect);
      const curHandNum = handNum;

      // After interval over, i.e. done incrementing credits
      setTimeout(() => {
        if (handNum === curHandNum) {
          // Wait 10 secs, if user has not started a new hand
          createFaceDownCardsUI(true);
          output.innerText = credits > 0 ? 'ENTER BET TO PLAY' : 'GAME OVER';
          output.classList.add('blink');
        }
      }, 10000);
      resetGame();
      resetUI(credits);
    }
  }, 2000 / intervalLength);
};

/**
 * Deal a new hand, called when:
 * 1. Bets 1-4 chips and clicks Deal
 * 2. Bet is on 4 chips and clicks Bet One or Bet Max
 * 3. Bet is on 0-4 chips and clicks Bet Max
 */
const dealHand = () => {
  deck = makeDeck();
  handInProgress = true;

  for (let i = 0; i < CARDS_IN_HAND; i += 1) {
    const card = deck.pop();
    hand.push(card);
  }
  createFaceUpCardsUI(hand);
  const handType = determineHandType(hand);
  if (handType) {
    const index = handTypes.indexOf(handType);
    setTableEffects('highlightHandType', index + 1, null);
  }
  output.innerText = 'Please select cards to hold';

  betOneButton.disabled = true;
  betMaxButton.disabled = true;
  dealButton.innerText = 'DRAW';
};

/**
 * Increase bet amt, called on click of Bet One or Bet Max
 * @param {number} amt - 1 if Bet One, 5 if Bet Max
 */
const increaseBet = (amt) => {
  if (handInProgress) {
    handNum += 1;
    handInProgress = false;
    createFaceDownCardsUI(false);
  }

  output.classList.remove('blink');
  output.innerText = 'Good luck!';

  const total = bet + credits;
  bet = amt === MAX_BET ? Math.min(total, MAX_BET) : bet + 1;
  credits = total - bet;
  betLabel.innerText = `BET ${bet}`;
  numCreditsLabel.innerText = `CREDITS ${credits}`;
  setTableEffects('highlightColumn', null, bet + 1);

  betAudio.pause();
  betAudio.currentTime = 0;
  betAudio.play();

  dealButton.disabled = false;
  if (amt === MAX_BET || bet === MAX_BET || credits === 0) {
    betOneButton.disabled = true;
    betMaxButton.disabled = true;
    dealHand();
  }
};

/**
 * Event listeners for buttons
 */

betOneButton.addEventListener('click', () => {
  increaseBet(1);
});

betMaxButton.addEventListener('click', () => {
  increaseBet(MAX_BET);
});

dealButton.addEventListener('click', () => {
  if (!handInProgress) { dealHand(); }
  else {
    dealButton.disabled = true;
    swapCards();
    payoutPlayer();
  }
});

/**
 * Create a set of face down cards with isIdle = true to get a nice animation when loading the page
 */
createFaceDownCardsUI(true);
