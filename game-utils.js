/* eslint-disable no-unused-vars */

/**
 * Global variables
 */

const MAX_BET = 5;
const CARDS_IN_HAND = 5;

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

const handTypes = Object.keys(payouts);

/**
 * Generate a card object given a rank and suit
 * @param {number} cardRank - A number from 1 to 13
 * @param {number} suit - A number from 0 to 4
 * @returns {Object} - A card object
 */
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

/**
 * Generates the deck for gameplay
 * @returns {Array} - An array of 52 card objects
 */
const makeDeck = () => {
  const deck = [];
  for (let i = 1; i <= 13; i += 1) {
    for (let j = 0; j < 4; j += 1) {
      // generates cards and inserts randomly to get a shuffled 52-card deck
      const randomIndex = Math.floor(Math.random() * (deck.length + 1));
      deck.splice(randomIndex, 0, generateCard(i, j));
    }
  }
  return deck;
};

/**
 * Given an array of card objects, returns an array of the sorted ranks
 * @param {Array} cards
 * @returns {Array} - Array of integers
 */
const getSortedRanks = (cards) => cards.map((card) => card.rank).sort((a, b) => a - b);

/**
 * Given an array of card objects, returns an array of the sorted ranks
 * @param {Array} cards
 * @returns {Array} - Array of strings
 */
const getSuits = (cards) => cards.map((card) => card.suit);

/**
 * Given an array and a item, returns the count of that item in the array
 * @param {Array} arr
 * @param {any} item
 * @returns {number}
 */
const count = (arr, item) => arr.filter((ele) => ele === item).length;

/**
 * Given an array, returns a set from that array i.e. the unique values
 * @param {Array} arr
 * @returns {Set}
 */
const set = (arr) => new Set(arr);

/**
 * Helper function to check the special case for a straight
 * @param {Array} ranks
 * @returns {boolean}
 */
const isTenToAce = (ranks) => {
  const tenToAce = [1, 10, 11, 12, 13];
  return ranks.every((ele, index) => tenToAce[index] === ele);
};

/**
 * Below functions (isFlush to isJacksOrBetterPair) all check for whether a given poker hand
 * is the named hand type
 * @param {Array} ranks
 * @param {Array} suits
 * @returns {boolean}
 */
const isFlush = (suits) => set(suits).size === 1;

const isStraight = (ranks) => {
  if (isTenToAce(ranks)) return true;

  for (let i = 1; i < ranks.length; i += 1) {
    if (ranks[i] !== ranks[i - 1] + 1) return false;
  }

  return true;
};

const isRoyalFlush = (ranks, suits) => isFlush(suits) && isTenToAce(ranks);

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

/**
 * Determine the poker hand ranking given 5 cards
 * @param {Array} cards
 * @returns {String | null} - The ranking of the hand
 */
const determineHandType = (cards) => {
  const ranks = getSortedRanks(cards);
  const suits = getSuits(cards);

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
