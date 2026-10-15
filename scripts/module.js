import { MODULE_ID } from "./const.js";
import {
  createHeroActionDeck,
  createHeroActionDiscard,
  createHeroActionHand,
} from "./helpers.js";
import { modifyVillainPoints, setupHeroicFatesHUD } from "./lib/adventures+.js";
import { registerSettings } from "./settings.js";
import { setupHeroActionHUD } from "./ui.js";

Hooks.once("init", async function () {
  registerSettings();
});

Hooks.once("ready", async function () {
  if (game.settings.get(MODULE_ID, "adventures-plus.enabled")) {
    game.socket.on(`module.${MODULE_ID}`, ({ event, data }) => {
      if (event === "modifyVillainPoints" && game.user.isGM) {
        const change = Number(data?.change);
        if (!Number.isNaN(change)) {
          modifyVillainPoints(change);
        }
      }
    });
    if (game.user.isGM) {
      Hooks.on("updateSetting", (setting) => {
        if (setting?.key === "pf2e-hero-deck-unofficial.villain-points") {
          setupHeroicFatesHUD();
        }
      });
    } else {
      Hooks.on("updateActor", (char, update) => {
        if (
          char?.uuid === game.user?.character?.uuid &&
          update?.system?.resources?.heroPoints?.value !== "undefined"
        ) {
          setupHeroicFatesHUD();
        }
      });
    }
    setupHeroicFatesHUD();
  } else {
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
      setupHeroActionHUD();
    });
  }
});
