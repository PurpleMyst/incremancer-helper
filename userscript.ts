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
    observer.observe(document, { childList: true, subtree: true, characterData: true, attributes: true });
  });

// Find an element in a collection by its textContent
const findByText = <T extends Element>(
  elements: HTMLCollectionOf<T>,
  text: string
): T | undefined => Array.from(elements).find(el => el.textContent === text);

// Autoclick a spell everytime its not on cooldown
const autoclickSpell = async (spellName: string) => {
  const spell = await waitForElement(() =>
    findByText(document.getElementsByTagName("span"), spellName)
  );

  const timer = spell.parentElement?.getElementsByClassName("timer").item(0);

  // If there's no timer, the spell isn't on cooldown and we can click it
  if (timer == null) {
    console.info(`Cast ${spellName}`);
    spell.click();

    // Wait for the timer to appear
    setTimeout(autoclickSpell, 0, spellName);
  } else {
    // If we have a timer, its text will represent how long the cooldown is
    const cooldown = +(timer.textContent ?? 0);
    console.info(`Sleeping for ${cooldown} seconds for ${spellName} ...`);
    setTimeout(autoclickSpell, cooldown * MS_PER_S, spellName);
  }
};

// Autobuy an upgrade
const autobuy = (upgrade: Element) => {
  console.info(`Autobuying ${upgrade.firstElementChild?.textContent}`);
  Array.from(upgrade.getElementsByTagName("button"))
    .find(el => el.textContent === "Auto")
    ?.click();
};

// Open the shop, select all tabs and autobuy every upgrade
const autobuyAll = async () => {
  const buttons = await waitForElement(() =>
    document.getElementsByClassName("buttons").item(0)
  );

  const shopButton = await waitForElement(() =>
    findByText(buttons.getElementsByTagName("button"), "Shop")
  );
  shopButton.click();

  const tabs = await waitForElement(() =>
    document.getElementsByClassName("tabs").item(0)
  );

  for (let tab of tabs.children) {
    if (tab.textContent === "Complete") continue;
    (tab as HTMLButtonElement).click();
    for (const upgrade of document.getElementsByClassName("upgrade"))
      autobuy(upgrade);
  }

  const closeButton = await waitForElement(() =>
    findByText(document.getElementsByTagName("button"), "Close")
  );
  closeButton.click();
};

autoclickSpell("Time Warp");
autoclickSpell("Energy Charge");
autoclickSpell("Earth Freeze");
autobuyAll();

// Autostart the game
waitForElement(() =>
  Array.from(document.getElementsByTagName("button")).find(btn =>
    btn.textContent?.startsWith("Start ")
  )
).then(btn => btn.click());
