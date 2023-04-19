/**
 * @fileoverview Puppeteer utility functions for text extraction and scrolling.
 */

/**
 * Extract the innerText of an element using a given selector.
 * @param {object} element - The Puppeteer element handle.
 * @param {string} selector - The CSS selector to find the target element.
 * @returns {string} The innerText of the target element.
 * @throws {Error} If an error occurs during the operation.
 */
async function getText(element, selector) {
  return await element.$eval(selector, (el) => el.innerText);
}

/**
 * Scroll an element in a Puppeteer page to the end using a given selector.
 * @param {object} page - The Puppeteer page object.
 * @param {string} selector - The CSS selector to find the target element.
 */
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
