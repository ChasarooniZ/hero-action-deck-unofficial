import { MODULE_ID } from "./const.js";
import {
  createHeroActionDeck,
  createHeroActionDiscard,
  createHeroActionHand,
} from "./helpers.js";
import { registerSettings } from "./settings.js";
import { setupHeroActionHUD } from "./ui.js";

Hooks.once("init", async function () {
  registerSettings();
});

Hooks.once("ready", async function () {
  if (
    !game.settings.get(MODULE_ID, "deck.id.hero-actions") ||
    !game.cards.get(game.settings.get(MODULE_ID, "deck.id.hero-actions"))
  ) {
    await createHeroActionDeck();
  }
  if (
    !game.settings.get(MODULE_ID, "deck.id.hand") ||
    !game.cards.get(game.settings.get(MODULE_ID, "deck.id.hand"))
  ) {
    await createHeroActionHand();
  }
  if (
    !game.settings.get(MODULE_ID, "deck.id.discard") ||
    !game.cards.get(game.settings.get(MODULE_ID, "deck.id.discard"))
  ) {
    await createHeroActionDiscard();
  }
  Hooks.on("createCard", async (card) => {
    if (
      [
        game.settings.get(MODULE_ID, "deck.id.hand"),
        game.settings.get(MODULE_ID, "deck.id.discard"),
      ]?.includes(card?.parent?.id)
    ) {
      setTimeout(setupHeroActionHUD, 500);
    }
  });
  setupHeroActionHUD();
});
