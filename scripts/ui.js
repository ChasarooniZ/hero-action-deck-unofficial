import { discard, getDeck, getDiscard, getHand, play } from "./helpers";

export async function setupHeroActionHUD() {
  const handInfo = getHandCardInfo();
  const content = getHandHTML(handInfo);

  const existingElement = document.querySelector("aside#hero-action-hand");
  if (existingElement) {
    existingElement.remove();
  }

  const playerlist = document.querySelector("aside#players");
  playerlist.insertAdjacentHTML(
    "afterend",
    `<aside id="hero-action-hand" class="plain">
    <div class="hero-action-container">
        <div  class="flexrow">
        ${content}
    </div>
    <footer class="form-footer" data-application-part="footer">
        <button type="button" class="" data-action="draw">
            <i class="fa-solid fa-plus" inert=""></i>
            <span>Re Draw</span>
        </button>
    </footer>
</div>
</aside>`,
  );

  document
    .querySelectorAll("aside#hero-action-hand img.hero-action-card")
    .forEach((cardHTML) => {
      cardHTML.addEventListener("click", (e) => {
        const id = e.target.id;
        cardAction(id);
      });
    });

  document
    .querySelector("aside#hero-action-hand button[data-action='draw']")
    .addEventListener("click", (e) => {
      const hand = getHand();
      const deck = getDeck();
      const max = game.settings.get(MODULE_ID, "hero-actions.max");
      const count = max - hand.cards.size;

      if (count > 0) {
        draw(count, { heroActionDeck: hand, heroActionSource: deck });
      }
    });
}

function getHandHTML(handData) {
  return handData
    .map(
      (card) =>
        `<div><img src="${card.img}" width=50 data-tooltip="<p><b>${card.name}</b></p>${card.description}" data-tooltip-direction="UP" id="${card.id}" class="hero-action-card"></div>`,
    )
    .join("");
}

function cardAction(cardID) {
  const hand = getHand();
  const discard = getDiscard();

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
        play(card);
      } else if (result === "discard") {
        discard(card);
      }
    },
  }).render({ force: true });
}

function getHeroPointArt(val, max) {
  const empty = max - val;
  const res = "".padStart(empty, "◇").padEnd(max, "◈");
  return res;
}
