async function getText(element, selector) {
  return await element.$eval(selector, (el) => el.innerText);
}

module.exports = { getText };
