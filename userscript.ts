const MS_PER_S = 1000;

// Wait until an element is present in the DOM
const waitForElement = <T>(selector: () => T | undefined | null): Promise<T> =>
  new Promise(resolve => {
    const observer = new MutationObserver(() => {
      const element = selector();
      if (element == null) return;
      observer.disconnect();
      resolve(element);
    });
    observer.observe(document, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });
  });

// Find an element in a collection by its textContent
const findByText = <T extends Element>(
  elements: HTMLCollectionOf<T>,
  text: string
): T | undefined => Array.from(elements).find(el => el.textContent === text);

const findByRegExp = <T extends Element>(
  elements: HTMLCollectionOf<T>,
  rgx: RegExp
): T | undefined =>
  Array.from(elements).find(
    el => el.textContent !== null && rgx.test(el.textContent)
  );

// Autoclick a spell everytime its not on cooldown
// TODO: Use more specific MutationObserver to improve performance;
// We can use a MutationObserver on `.spells` to wait for spells to appear if
// they are not present then we can use a second MutationObserver on the spell
// to wait for the timer to disappear
const autoclickSpell = async (spellName: string) => {
  const spell = await waitForElement(() =>
    findByText(document.getElementsByTagName("span"), spellName)
  );

  const timer = spell.parentElement?.getElementsByClassName("timer").item(0);

  // If there's no timer, the spell isn't on cooldown and we can click it
  if (timer == null) {
    spell.click();

    // Wait for the timer to appear
    setTimeout(autoclickSpell, 0, spellName);
  } else {
    // If we have a timer, its text will represent how long the cooldown is
    const cooldown = +(timer.textContent ?? 0);
    setTimeout(autoclickSpell, cooldown * MS_PER_S, spellName);
  }
};

// Autobuy an upgrade
const autobuy = (upgrade: Element) => {
  Array.from(upgrade.getElementsByTagName("button"))
    .find(el => el.textContent === "Auto")
    ?.click();
};

const openPanel = async (name: RegExp) => {
  const buttons = await waitForElement(() =>
    document.getElementsByClassName("buttons").item(0)
  );

  const panelButton = await waitForElement(() =>
    findByRegExp(buttons.getElementsByTagName("button"), name)
  );

  panelButton.click();
};

const closePanel = async () => {
  (
    await waitForElement(() => {
      return findByText(document.getElementsByTagName("button"), "Close");
    })
  ).click();
};

// Open the shop, select all tabs and autobuy every upgrade
const autobuyAll = async () => {
  openPanel(/Shop/);

  const tabs = await waitForElement(() =>
    document.getElementsByClassName("tabs").item(0)
  );

  for (const tab of tabs.getElementsByTagName("button")) {
    if (tab.textContent === "Complete") continue;
    tab.click();
    for (const upgrade of document.getElementsByClassName("upgrade"))
      autobuy(upgrade);
  }

  closePanel();
};

const autoconstruct = async () => {
  openPanel(/Construction/);
  (
    await waitForElement(() =>
      findByText(document.getElementsByTagName("button"), "Auto Off")
    )
  ).click();
  closePanel();
};

autoclickSpell("Time Warp");
autoclickSpell("Energy Charge");
autoclickSpell("Earth Freeze");
autobuyAll().then(() => autoconstruct());

// Autostart the game
waitForElement(() =>
  Array.from(document.getElementsByTagName("button")).find(btn =>
    btn.textContent?.startsWith("Start ")
  )
).then(btn => btn.click());
