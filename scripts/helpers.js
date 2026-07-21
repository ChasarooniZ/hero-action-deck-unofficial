import { MODULE_ID } from "./module.js";
const HERO_ACTION_DECK_UUID =
  "Compendium.pf2e-hero-deck-unofficial.pf2e-hero-action-card-deck-unofficial.Cards.Q1sFpa5AmQOCmqf2";

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
  const deck = await Cards.create({ name: "Hero Actions: Hand", type: "hand" });
  await game.settings.set(MODULE_ID, "deck.id.hand", deck.id);
}

export async function createHeroActionDiscard() {
  const deck = await Cards.create({
    name: "Hero Actions: Discard",
    type: "pile",
  });
  await game.settings.set(MODULE_ID, "deck.id.discard", deck.id);
}

export function draw(count) {
  const deck = getDeck();
  const hand = getHand();
  const res = hand.draw(deck, count, {
    how: CONST.CARD_DRAW_MODES.RANDOM,
    chatNotification: true,
  });
  console.log("Draw", res);
}

export function play(card) {
  const discard = getDiscard();
  game.modules
    .get("orcnog-card-viewer")
    .api.view(heroActionDeck.name, card.id, false);
  card.play(discard, { chatNotification: true });
}

export function discard(card) {
  const discard = getDiscard();
  card.discard(discard, { chatNotification: true });
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
