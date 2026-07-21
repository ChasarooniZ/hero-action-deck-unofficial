import {
  discardCard,
  fillUpHand,
  getHand,
  getHandCardInfo,
  playCard,
} from "./helpers.js";
import { EMPTY_IMG, MODULE_ID } from "./const.js";

const PX_PER_CARD = 60;

export async function setupHeroActionHUD() {
  const handInfo = await getHandCardInfo();
  const content = getHandHTML(handInfo);
  const max = game.settings.get(MODULE_ID, "hero-actions.max");

  const existingElement = document.querySelector("aside#hero-action-hand");
  if (existingElement) {
    existingElement.remove();
  }

  const playerlist = document.querySelector("aside#players");
  playerlist.insertAdjacentHTML(
    "afterend",
    `<aside id="hero-action-hand" class="plain">
    <div class="hero-action-container" style="--hero-action-container-width: ${max * PX_PER_CARD}px">
        <div  class="flexrow">
        ${content}
    </div>
</div>
</aside>`,
  );

  document
    .querySelectorAll("aside#hero-action-hand img.hero-action-card")
    .forEach((cardHTML) => {
      cardHTML.addEventListener("click", (e) => {
        const id = e?.target?.id;
        if (id) {
          cardAction(id);
        } else {
          fillUpHand();
        }
      });
    });
}

function getHandHTML(handData) {
  const max = game.settings.get(MODULE_ID, "hero-actions.max");
  const empty = max - handData?.length;

  const cardData = handData;
  for (let i = 0; i < empty; i++) {
    cardData.push({
      img: EMPTY_IMG,
      name: "Draw Remaining Hero Action Cards?",
      description: "Click Me to draw the remaining hero action cards",
      id: "",
    });
  }
  return cardData
    .map(
      (card) =>
        `<div><img src="${card.img}" width=50 data-tooltip="
      <p><b>${card.name}</b></p>
      ${card.description}
      <hr>
      <b>${card.id ? "Open Menu" : "Draw Remaining Cards"}</b> <span
                        class='reference'>
        ${game.i18n.localize("CONTROLS.LeftClick")}
    </span>
      "
      data-tooltip-direction="UP" id="${card.id}" class="hero-action-card"></div>`,
    )
    .join("");
}

function cardAction(cardID) {
  const hand = getHand();

  const card = hand.cards.get(cardID);

  const actor = game.user?.character ?? canvas.tokens.controlled?.[0]?.actor;

  const hpVal = actor?.system?.resources?.heroPoints?.value ?? 0;
  const hpMax = actor?.system?.resources?.heroPoints?.max ?? 0;

  const hpText = getHeroPointArt(hpVal, hpMax);

  new foundry.applications.api.DialogV2({
    window: { title: `Hero Point Card - (${hpText} HP)` },
    content: `<img src="${card?.faces?.[0]?.img}" height=500 alt="${card.name}" />`,
    buttons: [
      {
        action: "play",
        label: "Play Card",
        icon: "fa-solid fa-cards",
      },
      {
        action: "discard",
        label: "Discard Card",
        icon: "fa-duotone fa-solid fa-cards-blank",
      },
      {
        action: "cancel",
        label: "Cancel",
        icon: "fa-solid fa-x",
        default: true,
      },
    ],
    submit: (result) => {
      console.log({ result });
      if (result === "play") {
        playCard(card);
      } else if (result === "discard") {
        discardCard(card);
      }
    },
  }).render({ force: true });
}

function getHeroPointArt(val, max) {
  const empty = max - val;
  const res = "".padStart(empty, "◇").padEnd(max, "◈");
  return res;
}
