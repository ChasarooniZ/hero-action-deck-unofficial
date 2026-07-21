import { MODULE_ID } from "./module.js";

export function registerSettings() {
  game.settings.register(MODULE_ID, "deck.id.hero-action", {
    name: `${MODULE_ID}.module-settings.deck.id.hero-action.name`,
    hint: `${MODULE_ID}.module-settings.deck.id.hero-action.hint`,
    scope: "world",
    config: true,
    type: String,
    default: "",
  });

  game.settings.register(MODULE_ID, "deck.id.hand", {
    name: `${MODULE_ID}.module-settings.deck.id.hand.name`,
    hint: `${MODULE_ID}.module-settings.deck.id.hand.hint`,
    scope: "world",
    config: true,
    type: String,
    default: "",
  });

  game.settings.register(MODULE_ID, "deck.id.discard", {
    name: `${MODULE_ID}.module-settings.deck.id.discard.name`,
    hint: `${MODULE_ID}.module-settings.deck.id.discard.hint`,
    scope: "world",
    config: true,
    type: String,
    default: "",
  });

  game.settings.register(MODULE_ID, "hero-actions.max", {
    name: `${MODULE_ID}.module-settings.hero-actions.max.name`,
    hint: `${MODULE_ID}.module-settings.hero-actions.max.hint`,
    scope: "world",
    config: true,
    type: Number,
    default: 3,
  });
}
