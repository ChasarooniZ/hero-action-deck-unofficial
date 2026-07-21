import {
  createHeroActionDeck,
  createHeroActionDiscard,
  createHeroActionHand,
} from "./helpers.js";
import { registerSettings } from "./settings.js";
import { setupHeroActionHUD } from "./ui.js";

export const MODULE_ID = "pf2e-hero-deck-unnofficial";

Hooks.once("init", async function () {
  registerSettings();
});

Hooks.once("ready", async function () {
  if (!game.settings.get(MODULE_ID, "deck.id.hero-actions")) {
    await createHeroActionDeck();
  }
  if (!game.settings.get(MODULE_ID, "deck.id.hand")) {
    await createHeroActionHand();
  }
  if (!game.settings.get(MODULE_ID, "deck.id.discard")) {
    await createHeroActionDiscard();
  }
  Hooks.on("passCards", async (deckA, deckB) => {
    if (
      [deckA.id, deckB.id].includes(
        game.settings.get(MODULE_ID, "deck.id.hand"),
      )
    ) {
      setupHeroActionHUD();
    }
  });
  setupHeroActionHUD();
});
