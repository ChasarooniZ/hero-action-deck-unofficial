import { drawCardsAnimation, playCardAnimation } from "./animation.js";
import { HERO_ACTION_DECK_UUID } from "./const.js";
import { MODULE_ID } from "./const.js";
export async function getHandCardInfo() {
  const hand = getHand();
  const relevantData = hand.cards.contents.map((card) => ({
    img: card.faces?.[0].img,
    name: card.faces?.[0].name,
    text: card.faces?.[0].text,
    id: card?.id,
  }));

  const descriptionPromises = relevantData.map((data) =>
    TextEditor.enrichHTML(data.text),
  );

  await Promise.allSettled(descriptionPromises).then((results) => {
    results.forEach((desc, cnt) => {
      relevantData[cnt].description = desc.value.replaceAll('"', "'");
    });
  });
  return relevantData;
}

export async function createHeroActionDeck() {
  const data = (await fromUuid(HERO_ACTION_DECK_UUID)).toObject();
  data.ownership.default = 3;
  const deck = await Cards.create(data);
  await game.settings.set(MODULE_ID, "deck.id.hero-actions", deck.id);
}

export async function createHeroActionHand() {
  const deck = await Cards.create({
    name: "Hero Actions: Hand",
    type: "hand",
    ownership: {
      default: 3,
    },
  });
  await game.settings.set(MODULE_ID, "deck.id.hand", deck.id);
}

export async function createHeroActionDiscard() {
  const deck = await Cards.create({
    name: "Hero Actions: Discard",
    type: "pile",
    ownership: {
      default: 3,
    },
  });
  await game.settings.set(MODULE_ID, "deck.id.discard", deck.id);
}

export function fillUpHand() {
  const hand = getHand();
  const deck = getDeck();
  const max = game.settings.get(MODULE_ID, "hero-actions.max");
  const count = max - hand.cards.size;

  if (count > 0) {
    drawCard(count, { heroActionDeck: hand, heroActionSource: deck });
  }
}

export async function drawCard(count) {
  const deck = getDeck();
  const hand = getHand();
  const cards = await hand.draw(deck, count, {
    how: CONST.CARD_DRAW_MODES.RANDOM,
    chatNotification: true,
  });
  if (game.settings.get(MODULE_ID, "animations.enabled")) {
    drawCardsAnimation(cards);
  }
}

export async function playCard(card) {
  const discard = getDiscard();
  if (game.settings.get(MODULE_ID, "animations.enabled")) {
    playCardAnimation(card);
  }
  card.play(discard, { chatNotification: true });
}

export async function discardCard(card) {
  const discard = getDiscard();
  card.discard(discard, { chatNotification: true });
  console.log("Discard", card);
}

export function getHand() {
  return game.cards.get(game.settings.get(MODULE_ID, "deck.id.hand"));
}
export function getDeck() {
  return game.cards.get(game.settings.get(MODULE_ID, "deck.id.hero-actions"));
}
export function getDiscard() {
  return game.cards.get(game.settings.get(MODULE_ID, "deck.id.discard"));
}
