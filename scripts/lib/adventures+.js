import { MODULE_ID, PX_PER_CARD } from "../const.js";

export async function setupHeroicFatesHUD() {
  const existingElement = document.querySelector("aside#heroic-fates-hud");
  if (existingElement) {
    existingElement.remove();
  }

  const isGM = game.user.isGM;

  const points = isGM
    ? game.settings.get(MODULE_ID, "villain-points")
    : game.user?.character?.system?.resources?.heroPoints?.value;

  let heroPointHTML = `<div class="flexcol hero-points" style="flex-shrink: 0" data-tooltip="<p><b>Add Point</b> <span class='reference'>Click</span></p><p><b>Remove Point</b> <span class='reference'>Right Click</span></p>">`;
  for (let i = 0; i < points; i++) {
    heroPointHTML += `<i class="fa-solid fa-circle-${isGM ? "v" : "h"}"></i>`;
  }
  for (let i = 0; i < max - points; i++) {
    heroPointHTML += `<i class="fa-regular fa-circle"></i>`;
  }
  heroPointHTML += `</div>`;

  const content = getFatesOptions(isGM, points);

  const playerlist = document.querySelector("aside#players");
  playerlist.insertAdjacentHTML(
    "afterend",
    `<aside id="heroic-fates-hud" class="plain">
    <div class="hero-action-container" style="flexrow; display:flex; --hero-action-container-width: ${120}px">
        ${heroPointHTML}
        <div class="flexcol">
            <div class="flexrow fates">
                ${content}
            </div>
        </div>
    </div>
</aside>`,
  );

  const hpHTML = document.querySelector("div.hero-points");

  hpHTML.addEventListener("click", (e) => {
    if (isGM) {
      const p = game.settings.get(MODULE_ID, "villain-points");
      if (p !== Math.min(p + 1, max))
        game.settings.set(MODULE_ID, "villain-points", Math.min(p + 1, max));
    } else {
      const p = game.user?.character?.system?.resources?.heroPoints?.value;
      if (p !== Math.min(p + 1, max))
        game.user?.character.update({
          "system.resources.heroPoints.value": Math.min(p + 1, max),
        });
    }
  });

  hpHTML.addEventListener("contextmenu", (e) => {
    if (isGM) {
      const p = game.settings.get(MODULE_ID, "villain-points");
      if (p !== Math.max(p - 1, 0))
        game.settings.set(MODULE_ID, "villain-points", Math.max(p - 1, 0));
    } else {
      const p = game.user?.character?.system?.resources?.heroPoints?.value;
      if (p !== Math.max(p - 1, 0))
        game.user?.character.update({
          "system.resources.heroPoints.value": Math.max(p - 1, 0),
        });
    }
  });

  document
    .querySelectorAll(
      "aside#heroic-fates-hud div.fates i:not(.disabled), aside#heroic-fates-hud div.fates span:not(.disabled)",
    )
    .forEach((cardHTML) => {
      cardHTML.addEventListener("click", (e) => {
        const id = e?.target?.id;
        if (id) {
          const fate = (isGM ? VILLAIN_POINT_FATES : HERO_POINT_FATES)?.find(
            (f) => f.name === id,
          );
          //Replace Points spent
          createFateChatMessage(fate, isGM, 3);
        }
        // if (id) {
        //   cardAction(id);
        // } else {
        //   fillUpHand();
        // }
      });
    });
}

const max = 3;

function getFatesOptions(isGM, points) {
  const fates = (isGM ? VILLAIN_POINT_FATES : HERO_POINT_FATES)
    .map((f) => {
      const tiers = f.tiers?.length
        ? `<ul><li>${f.tiers.map((t) => `<p style="${points < t.cost ? "text-decoration: line-through; opacity: 60%" : " "}"><b>${t.cost} ${isGM ? "Villain Point" : "Hero Point"}${t.cost > 1 ? "s" : ""}</b> ${t.text.replaceAll(/'/g, "&apos;").replaceAll(/"/g, "&quot;")}</p>`).join("</li><li>")}</li></ul>`
        : "";
      const tooltip = `
        <h4>${f.name}</h4>
        <b>Trigger</b> ${f.trigger.replaceAll(/'/g, "&apos;").replaceAll(/"/g, "&quot;")}<br>
        <b>Cost</b> ${f.cost.replaceAll(/'/g, "&apos;").replaceAll(/"/g, "&quot;")}
        ${f.requirements ? `<br><b>Requirements</b> ${f.requirements.replaceAll(/'/g, "&apos;").replaceAll(/"/g, "&quot;")}` : ""}
        <hr>
        ${f.intro.replaceAll(/'/g, "&apos;").replaceAll(/"/g, "&quot;")}<br>
        ${tiers}
        ${f.special ? `<b>Special</b> ${f.special.replaceAll(/'/g, "&apos;").replaceAll(/"/g, "&quot;")}` : ""}
        `;

      const cantAfford = points < Number(f.cost.charAt(0));
      return f.icon.replace(
        'class="',
        `data-tooltip='${tooltip}' id="${f.name}" style="${cantAfford ? "opacity: 60%" : ""}" class=\"${cantAfford ? "disabled" : ""}`,
      );
    })
    .join("");

  return fates;
}

function createFateChatMessage(fate, isGM, pointsSpent = 0) {
  const pointName = isGM ? "Villain Point" : "Hero Point";

  // Only show tiers whose cost is <= pointsSpent
  const visibleTiers = fate.tiers?.filter((t) => t.cost <= pointsSpent) ?? [];

  const tiers = visibleTiers.length
    ? `<ul><li>${visibleTiers
        .map(
          (t) =>
            `<b>${t.cost} ${pointName}${t.cost > 1 ? "s" : ""}</b> ${t.text}`,
        )
        .join("</li><li>")}</li></ul>`
    : "";

  const content = `
    <h4>${fate.icon} ${fate.name}</h4>
    <b>Trigger</b> ${fate.trigger}<br>
    <b>Cost</b> ${fate.cost}
    ${fate.requirements ? `<br><b>Requirements</b> ${fate.requirements}` : ""}
    <hr>
    ${fate.intro}<br>
    ${tiers}
    ${fate.special ? `<b>Special</b> ${fate.special}` : ""}
  `;

  ChatMessage.create({ content });
}
const HERO_POINT_FATES = [
  {
    icon: "<i class='fa-solid fa-dice-d20'></i>",
    category: "Fate",
    name: "Change Fate",
    trigger: "You made a check.",
    cost: "1 or 2 Hero Points",
    intro:
      "You refuse to accept your fate. This effect depends on the number of Hero Points you spend.",
    tiers: [
      {
        cost: 1,
        text: "Reroll the triggering check. You must use the second result.",
      },
      {
        cost: 2,
        text: "Reroll the triggering check. You must use the second result. You increase the degree of success of your check to be one step better.",
      },
    ],
    special: "",
  },
  {
    icon: "<i class='fa-solid fa-bolt'></i>",
    category: "Action",
    name: "Compelled to Action",
    trigger: "Your turn would begin.",
    cost: "2 Hero Points",
    intro:
      "You know now is the time to act. You gain 4 actions this turn instead of 3.",
    tiers: [],
    special: "",
  },
  {
    icon: "<i class='fa-solid fa-hand-holding-heart'></i>",
    category: "Support",
    name: "Friend in Need",
    trigger: "You attempt to Aid the check of another creature.",
    cost: "1 or 2 Hero Points",
    intro: "You know that a helping hand can often make the difference.",
    tiers: [
      {
        cost: 1,
        text: "If your Aid is successful, the triggering creature can roll twice and use the better result.",
      },
      {
        cost: 2,
        text: "If your Aid is successful, the triggering creature can roll twice and use the better result. The creature increases its degree of success to be one step better, regardless of whether they attempted to reroll the triggering check.",
      },
    ],
    special: "",
  },
  {
    icon: "<i class='fa-solid fa-heart-pulse'></i>",
    category: "Death",
    name: "Heroic Recovery",
    trigger: "Your dying condition would increase.",
    cost: "All your Hero Points",
    intro:
      "You avoid death. This effect depends on the number of Hero Points you spend.",
    tiers: [
      {
        cost: 1,
        text: "You lose the dying condition entirely and stabilize with 0 Hit Points. You don't gain the wounded condition or increase its value from losing the dying condition in this way, but if you already had that condition, you don't lose it or decrease its value.",
      },
      {
        cost: 2,
        text: "As 1 Hero Point, except you have 1 Hit Point. If the trigger of this effect was at the start of your turn due to already having the dying condition, you immediately gain your actions for the turn and rejoin initiative.",
      },
      {
        cost: 3,
        text: "As 2 Hero Points, except you have Hit Points equal to your level plus your Constitution modifier.",
      },
    ],
    special: "",
  },
  {
    icon: "<i class='fa-solid fa-people-arrows'></i>",
    category: "Teamwork",
    name: "Join Fates",
    trigger: "Your turn would begin.",
    cost: "3 Hero Points",
    frequency: "once per session",
    requirements: "You can perceive at least one ally.",
    intro:
      "You and your team have planned for a moment just like this. Choose up to 2 allies and a single target. The allies must be able to act and the target is typically a creature, hazard, or object. You can distribute two additional actions to the chosen allies, granting either 2 actions to one ally, or 1 action to two allies. You and your chosen allies can take these actions in any order during your turn but they must all involve the chosen target. The GM might allow you to target a broader objective, such as keeping an NPC safe or preventing a group of enemies from entering a room. You cannot use Join Fates again this session, but can still be a chosen ally for another character's Join Fates.",
    tiers: [],
    special: "",
  },
  {
    icon: "<i class='fa-solid fa-box-open'></i>",
    category: "Utility",
    name: "Just What I Needed",
    trigger: "Your turn would begin.",
    cost: "1 or 2 Hero Points; the cost of the item",
    intro:
      "You have the item you need, whether you forgot you purchased it, found it unexpectedly, or otherwise knew this moment would come. You pay the cost of the item, as if you had purchased it prior to this moment. The item can be drawn with a single Interact action provided it could have reasonably been stored there, otherwise it is stowed in the nearest location you could have stored it. This effect depends on the number of Hero Points you spend.",
    tiers: [
      {
        cost: 1,
        text: "You produce a common item. The item must be a piece of adventuring gear, and can't be a weapon, armor, alchemical item, magic item, or other treasure. It must be common with a level no higher than half your level, and its Bulk must be low enough that carrying it wouldn't have made you encumbered.",
      },
      {
        cost: 2,
        text: "As 1 Hero Point, except you can procure a consumable item, instead of a piece of adventuring gear. The consumable item must still be common with a level no higher than half your level, and its Bulk must be low enough that carrying it wouldn't have made you encumbered.",
      },
    ],
    special: "",
  },
  {
    icon: "<i class='fa-solid fa-skull'></i>",
    category: "Death",
    name: "Last Sacrifice",
    trigger: "You would gain the dying condition or you would die outright.",
    cost: "All your Hero Points",
    intro:
      "You know this is where it ends, but not without one last sacrifice. This effect depends on the number of Hero Points you spend.",
    tiers: [
      {
        cost: 1,
        text: "You do not die or gain the dying condition, remaining at 1 Hit Point. You can then immediately take your turn and your actions for the turn do not provoke reactions. You ignore all of your current afflictions and conditions, standing, retching, or similar as free actions when you use this Heroic Fate. After your turn ends, you immediately die.",
      },
      {
        cost: 2,
        text: "As 1 Hero Point, except you can choose one check during your turn to be an automatic critical success or a single saving throw against an effect you create to be a critical failure.",
      },
      {
        cost: 3,
        text: "As 2 Hero Points, except you can apply the effect twice instead of once.",
      },
    ],
    special:
      "When you die as the result of a Last Sacrifice, attempts to return you to life fail unless the effect's counteract rank is higher than half your level plus 4, or originates from an artifact or a deity.",
  },
  {
    icon: "<span class='action-glyph'>R</span>",
    category: "Fate",
    name: "Perfect Coincidence",
    trigger:
      "You would trigger a reaction but have already used your reactions for the turn.",
    cost: "1 Hero Point",
    intro:
      "Sometimes an opportunity knocks and a coincidence is too perfect. You use the triggered reaction.",
    tiers: [],
    special: "",
  },
];

const VILLAIN_POINT_FATES = [
  {
    icon: "<i class='fa-solid fa-triangle-exclamation'></i>",
    category: "Mistake",
    name: "Careless Mistake",
    trigger:
      "A player fails a skill check by 5 or more in which their proficiency is at least trained.",
    cost: "1 Villain Point",
    intro:
      "A careless mistake can lead to even greater woes. The degree of success of the triggering check is treated as one step worse.",
    tiers: [],
    special:
      "If the player has Untrained Improvisation, the trigger includes skill checks in which their proficiency is untrained.",
  },
  {
    icon: "<i class='fa-solid fa-crown'></i>",
    category: "Downfall",
    name: "Downfall, Not Done For",
    trigger: "A boss would suffer a Downfall.",
    cost: "2 Villain Points",
    intro:
      "Though a downfall can take the powerful down, down does not necessarily mean out. The boss suffers the normal effects of its Downfall, but it can still use its Boss Ability on its next turn unless it suffers another Downfall.",
    tiers: [],
    special: "",
  },
  {
    icon: "<i class='fa-solid fa-eye-slash'></i>",
    category: "Secret",
    name: "Dark Secrets",
    trigger: "A player attempts a secret check.",
    cost: "1 Villain Point",
    intro:
      "This secret is particularly dark. The degree of success of the triggering check is treated as one step worse.",
    tiers: [],
    special: "",
  },
  {
    icon: "<i class='fa-solid fa-heart-crack'></i>",
    category: "Death",
    name: "Deny Death",
    trigger:
      "A creature would take damage that would reduce it to 0 Hit Points.",
    cost: "1 to 2 Villain Points",
    requirements:
      "The triggering creature is at least 2 levels higher than the player.",
    intro:
      "The most harrowing enemies are those that rise when they should not. This effect depends on the number of Villain Points the GM spent.",
    tiers: [
      {
        cost: 1,
        text: "The triggering creature remains at 1 Hit Point.",
      },
      {
        cost: 2,
        text: "The triggering creature remains at Hit Points equal to its level.",
      },
    ],
    special: "",
  },
  {
    icon: "<i class='fa-solid fa-eye'></i>",
    category: "Fate",
    name: "Eyes of Fate",
    trigger:
      "A player immune to Twists of Fate sees a clear opportunity to follow an edict, an act of anathema, or similar pivotal moment if they do not worship a deity.",
    cost: "1 Villain Point",
    intro:
      "The eyes of fate are ever watchful. The player is no longer immune to Twists of Fate.",
    tiers: [],
    special: "",
  },
  {
    icon: "<i class='fa-solid fa-person-falling'></i>",
    category: "Fumble",
    name: "Fumble",
    trigger: "A player critically fails an attack roll.",
    cost: "1 to 2 Villain Points",
    intro:
      "The slightest misstep can cause even the greatest to falter. This effect depends on the number of Villain Points the GM spent.",
    tiers: [
      {
        cost: 1,
        text: "The player is off-guard until the beginning of their next turn.",
      },
      {
        cost: 2,
        text: "The player is knocked prone.",
      },
    ],
    special: "",
  },
  {
    icon: "<i class='fa-solid fa-shoe-prints'></i>",
    category: "Movement",
    name: "Ill-Fated Move",
    trigger: "A player begins a move action within 30 feet of a creature.",
    cost: "1 to 2 Villain Points",
    intro:
      "Moving can be tricky, especially in the face of enemies. This effect depends on the number of Villain Points the GM spent.",
    tiers: [
      {
        cost: 1,
        text: "The triggering creature can Step as a free action.",
      },
      {
        cost: 2,
        text: "The triggering creature can Stride up to half its Speed by spending its reaction. The creature can Burrow, Climb, Fly, or Swim instead of Stride if it has the corresponding movement type.",
      },
    ],
    special: "",
  },
  {
    icon: "<i class='fa-solid fa-user-secret'></i>",
    category: "Perception",
    name: "Lurking Danger",
    trigger:
      "A player makes a Perception check or a creature attempts a Stealth check.",
    cost: "1 Villain Point",
    intro:
      "The dangerous and the unknown are companions of dubious nature. If the trigger was a Perception check, roll twice and take the lower result. If the trigger was a Stealth check, roll twice and use the greater result.",
    tiers: [],
    special: "",
  },
  {
    icon: "<i class='fa-solid fa-reply'></i>",
    category: "Retaliation",
    name: "Return the Favor",
    trigger: "A player gets a success on an attack roll.",
    cost: "1 Villain Point",
    requirements: "The target of the attack roll is a creature.",
    intro:
      "Responding in kind often balances the scales. The target of the attack roll can immediately make a Strike against the player as a free action. If the target of the attack roll has the ability to Cast a Spell and can cast at least one spell attack cantrip that takes 2 actions or less to cast, they can instead cast a spell attack cantrip as a free action and they become slowed 1 until the end of their next turn.",
    tiers: [],
    special: "",
  },
  {
    icon: "<i class='fa-solid fa-clock'></i>",
    category: "Timing",
    name: "Uncanny Timing",
    trigger: "A player ends their turn.",
    cost: "2 or 3 Villain Points",
    intro:
      "The worst can happen when it is least expected. This effect depends on the number of Villain Points the GM spent.",
    tiers: [
      {
        cost: 2,
        text: "Choose a creature. The creature you chose immediately uses a single action even though it is not their turn.",
      },
      {
        cost: 3,
        text: "Choose up to 2 creatures. You can distribute two additional actions to the chosen creatures, granting either 2 actions to one creature, or 1 action to two creatures. The creatures you chose immediately use the actions even though it is not their turn. If it was distributed to 2 creatures, they can act in any order.",
      },
    ],
    special: "",
  },
];

// ChatMessage.create({
//   content: `${VILLAIN_POINT_FEATS.map((f) => `<button data-tooltip="${f.name}">${f.icon}</button>`).join("")}`,
// });

// ChatMessage.create({
//   content: `${HERO_POINT_FEATS.map((f) => `<button data-tooltip="${f.name}">${f.icon}</button>`).join("")}`,
// });
