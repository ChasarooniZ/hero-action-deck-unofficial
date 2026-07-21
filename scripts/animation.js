import {
  DELAY_PER_CARD,
  CARD_SCALE,
  BACK_SHOW_DURATION,
  PLAY_CARD_DURATION,
  FRONT_DURATION_PER_CARD,
  SFX,
} from "./const.js";

export function drawCardsAnimation(hand) {
  const cards = hand.map((card) => ({
    front: card?.faces?.[0]?.img,
    back: card?.back?.img,
  }));
  callCardAnim(cards);
  function callCardAnim(cards) {
    const hpDockPos = getHeroActionDockPosition();
    const seq = new Sequence();
    let cnt = 1;
    for (const card of cards) {
      addCardAnim(seq, card.front, card.back, cnt, cards.length, hpDockPos);
      cnt++;
    }
    seq.play({ preload: true });
  }
}

export function playCardAnimation(card) {
  const front = card?.faces?.[0]?.img;
  const back = card?.back?.img;
  const hpDockPos = getHeroActionDockPosition();
  const pos = { x: 0.5, y: 0.5 };
  const destPos = {
    x: hpDockPos.x / window.innerWidth - pos.x,
    y: hpDockPos.y / window.innerHeight - pos.y,
  };
  new Sequence()
    .effect()
    .file(front)
    .screenSpace()
    .screenSpaceAboveUI()
    .screenSpaceScale({ fitY: true, ratioX: true })
    .screenSpaceAnchor(pos)
    .scale(CARD_SCALE)
    .duration(PLAY_CARD_DURATION)
    .animateProperty("spriteContainer", "position.x", {
      from: destPos.x,
      to: 0,
      duration: 1000,
      screenSpace: true,
      ease: "easeInCubic",
    })
    .animateProperty("spriteContainer", "position.y", {
      from: destPos.y,
      to: 0,
      duration: 1000,
      screenSpace: true,
      ease: "easeInQuart",
    })
    .animateProperty("sprite", "scale.x", {
      from: 0.1,
      to: 1,
      duration: 1000,
      ease: "easeInQuart",
    })
    .animateProperty("sprite", "scale.y", {
      from: 0.1,
      to: 1,
      duration: 1000,
      ease: "easeInQuart",
    })
    .fadeOut(1000, { ease: "easeOutCubic" })
    .sound()
    .file(Sequencer.Helpers.random_object_element(SFX.TAKE))
    .volume(game.settings.get(MODULE_ID, "animations.volume"))
    .sound()
    .file(Sequencer.Helpers.random_object_element(SFX.PLAY))
    .volume(game.settings.get(MODULE_ID, "animations.volume"))
    .delay(1000)
    .play({ preload: true });
}

export function discardCardSFX() {
  new Sequence()
    .sound()
    .file(Sequencer.Helpers.random_object_element(SFX.DISCARD))
    .volume(game.settings.get(MODULE_ID, "animations.volume"))
    .play({ preload: true });
}

function addCardAnim(seq, front, back, cnt, amt, hpDockPos) {
  const pos = { x: cnt / (amt + 1), y: 0.5 };
  const destPos = {
    x: hpDockPos.x / window.innerWidth - pos.x,
    y: hpDockPos.y / window.innerHeight - pos.y,
  };
  const d = DELAY_PER_CARD * (cnt + 1);
  const frontDuration = FRONT_DURATION_PER_CARD * amt;

  return seq
    .effect()
    .file(back)
    .screenSpace()
    .screenSpaceAboveUI()
    .screenSpaceScale({ fitY: true, ratioX: true })
    .screenSpaceAnchor(pos)
    .delay(d)
    .scale(CARD_SCALE)
    .duration(BACK_SHOW_DURATION)
    .animateProperty("spriteContainer", "position.x", {
      from: 1.2,
      to: 0,
      duration: 500,
      screenSpace: true,
      ease: "easeOutCubic",
    })
    .animateProperty("sprite", "scale.x", {
      from: 1,
      to: 0,
      duration: 500,
      fromEnd: true,
      ease: "easeInCubic",
    })
    .sound()
    .delay(d)
    .file(Sequencer.Helpers.random_object_element(SFX.TAKE))
    .volume(game.settings.get(MODULE_ID, "animations.volume"))
    .effect()
    .delay(BACK_SHOW_DURATION + d)
    .file(front)
    .screenSpace()
    .screenSpaceAboveUI()
    .screenSpaceScale({ fitY: true, ratioX: true })
    .screenSpaceAnchor(pos)
    .scale(CARD_SCALE)
    .duration(frontDuration)
    .animateProperty("sprite", "scale.x", {
      from: 0,
      to: 1,
      duration: 500,
      ease: "easeOutCubic",
    })
    .animateProperty("spriteContainer", "position.x", {
      from: 0,
      to: destPos.x,
      duration: 750,
      delay: frontDuration - 750,
      screenSpace: true,
      ease: "easeInCubic",
    })
    .animateProperty("spriteContainer", "position.y", {
      from: 0,
      to: destPos.y,
      duration: 750,
      delay: frontDuration - 750,
      screenSpace: true,
      ease: "easeInBack",
    })
    .animateProperty("sprite", "scale.x", {
      from: 1,
      to: 0.1,
      duration: 1000,
      delay: frontDuration - 1000,
      ease: "easeOutQuart",
    })
    .animateProperty("sprite", "scale.y", {
      from: 1,
      to: 0.1,
      duration: 1000,
      delay: frontDuration - 1000,
      ease: "easeOutQuart",
    })
    .sound()
    .delay(BACK_SHOW_DURATION + frontDuration - 1000)
    .file(Sequencer.Helpers.random_object_element(SFX.PLACE))
    .volume(game.settings.get(MODULE_ID, "animations.volume"));
}

function getHeroActionDockPosition() {
  const hpDockRect = document
    .querySelector("aside#hero-action-hand div.hero-action-container")
    .getBoundingClientRect();

  return {
    x: hpDockRect.left + hpDockRect.width / 2,
    y: hpDockRect.top + hpDockRect.height / 2,
  };
}
