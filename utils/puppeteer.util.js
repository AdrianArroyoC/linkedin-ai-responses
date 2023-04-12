async function getText(element, selector) {
  return await element.$eval(selector, (el) => el.innerText);
}

async function scroll(page, selector) {
  await page.evaluate(async (selector) => {
    // eslint-disable-next-line no-undef
    const element = document.querySelector(selector);
    if (element) {
      let previousScrollTop;
      do {
        previousScrollTop = element.scrollTop;
        element.scrollTop = element.scrollHeight;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } while (element.scrollTop !== previousScrollTop);
    }
  }, selector);
}

module.exports = { getText, scroll };
