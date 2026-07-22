import {
  discardCardSFX,
  drawCardsAnimation,
  playCardAnimation,
} from "./animation.js";
import { HERO_ACTION_DECK_UUID } from "./const.js";
import { MODULE_ID } from "./const.js";

export async function getHandCardInfo() {
  const hand = getHand();
  const relevantData = await getEnrichedCardData(hand.cards.contents);
  return relevantData;
}

/**
 *
 *
 * @export
 * @param {*[]} cards
 * @return {{img: string, name: string, text: string, id: string, description: string}[]}
 */
export async function getEnrichedCardData(cards) {
  const relevantData = cards.map((card) => ({
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
    chatNotification: false,
  });
  if (game.settings.get(MODULE_ID, "animations.enabled")) {
    drawCardsAnimation(cards);
  }
  if (game.settings.get(MODULE_ID, "messages.enable")) {
    createMessage({ type: "draw", cards });
  }
}

export async function playCard(card) {
  const discard = getDiscard();
  if (game.settings.get(MODULE_ID, "animations.enabled")) {
    playCardAnimation(card);
  }
  card.play(discard, { chatNotification: false });
  reduceHeroPoints();
  if (game.settings.get(MODULE_ID, "messages.enable")) {
    createMessage({ type: "play", cards: [card] });
  }
}

export async function discardCard(card) {
  const discard = getDiscard();
  if (game.settings.get(MODULE_ID, "animations.enabled")) {
    discardCardSFX();
  }
  card.discard(discard, { chatNotification: false });
  if (game.settings.get(MODULE_ID, "messages.enable")) {
    createMessage({ type: "discard", cards: [card] });
  }
}

async function reduceHeroPoints() {
  const actor = getActor();
  const val = actor?.system?.resources?.heroPoints?.value;
  if (actor) {
    if (val > 0) {
      await actor.update({ "system.resources.heroPoints.value": val - 1 });
    } else if (!isNaN(Number(val))) {
      ui.notitifications.warn(
        game.i18n.format(
          "pf2e-hero-deck-unofficial.notifications.warning.not-enough-hp",
          { name: actor?.name },
        ),
      );
    }
  }
}

async function createMessage({ type, cards }) {
  const data = {};
  const actor = getActor();
  const cardData = await getEnrichedCardData(cards);
  switch (type) {
    case "draw":
      data.title = game.i18n.format(
        "pf2e-hero-deck-unofficial.message.title.draw",
        { s: cards?.length > 1 ? "s" : "" },
      );
      data.body = game.i18n.format(
        "pf2e-hero-deck-unofficial.message.body.draw",
        {
          name: game.user.name,
          cards: cardData
            .map(
              (card) =>
                `<u data-tooltip="${card?.description}">${card?.name}</u>`,
            )
            .join(", "),
        },
      );
      break;
    case "discard":
      data.title = game.i18n.format(
        "pf2e-hero-deck-unofficial.message.title.discard",
      );
      data.body = game.i18n.format(
        "pf2e-hero-deck-unofficial.message.body.discard",
        {
          name: game.user.name,
          card: `<u data-tooltip="${cardData?.[0]?.description}">${cardData?.[0]?.name}</u>`,
        },
      );
      break;
    case "play":
      data.title = game.i18n.format(
        "pf2e-hero-deck-unofficial.message.title.play",
      );
      data.body = game.i18n.format(
        "pf2e-hero-deck-unofficial.message.body.play",
        {
          name: game.user.name,
          card: `<u data-tooltip="${cardData?.[0]?.description}">${cardData?.[0]?.name}</u>`,
          cardData: `<hr><h6>${cardData?.[0]?.name}</h6><hr>${cardData?.[0]?.description}`,
        },
      );
      break;
    default:
      break;
  }

  if (!data?.title) {
    console.error("Invalid Create Message type");
    return;
  }
  const content = `<h4>${data.title}</h4>${data.body}`;
  await ChatMessage.create({
    author: game.user.id,
    content: content,
    speaker: ChatMessage.getSpeaker({
      actor: actor,
      scene: canvas.scene,
    }),
    flags: {
      pf2e: {
        origin: {
          actor: actor?.uuid,
          sourceId: actor?.id,
        },
      },
    },
  });
}

export function getActor() {
  return game.user?.character ?? canvas.tokens.controlled?.[0]?.actor;
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
