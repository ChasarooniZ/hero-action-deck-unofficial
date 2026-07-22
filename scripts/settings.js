import { MODULE_ID } from "./const.js";

export function registerSettings() {
  game.settings.register(MODULE_ID, "deck.id.hero-actions", {
    name: `${MODULE_ID}.module-settings.deck.id.hero-actions.name`,
    hint: `${MODULE_ID}.module-settings.deck.id.hero-actions.hint`,
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

  game.settings.register(MODULE_ID, "messages.enable", {
    name: `${MODULE_ID}.module-settings.messages.enable.name`,
    hint: `${MODULE_ID}.module-settings.messages.enable.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(MODULE_ID, "animations.enabled", {
    name: `${MODULE_ID}.module-settings.animations.enabled.name`,
    hint: `${MODULE_ID}.module-settings.animations.enabled.hint`,
    scope: "world",
    config: game.modules.get("sequencer")?.active,
    type: Boolean,
    default: game.modules.get("sequencer")?.active,
  });

  game.settings.register(MODULE_ID, "animations.volume", {
    name: `${MODULE_ID}.module-settings.animations.volume.name`,
    hint: `${MODULE_ID}.module-settings.animations.volume.hint`,
    scope: "world",
    config: game.modules.get("sequencer")?.active,
    type: Number,
    default: 0.5,
  });
}
