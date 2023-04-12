/**
 * @fileoverview LinkedInClass provides a service to automate LinkedIn message responses using web scraping and the ChatGPT API.
 */

/* eslint-disable no-console */
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const { linkedIn, headless } = require('../config');
const { getText, scroll } = require('../utils/puppeteer.util');
const { chatCompletion } = require('../utils/chatCompletion.util');

const { repository } = require('../package.json');

/**
 * @class
 * @classdesc A service to automate LinkedIn message responses using web scraping and the ChatGPT API.
 */
class LinkedInClass {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize a new browser instance with the specified configuration.
   * @private
   */
  async getBrowser() {
    const config = { headless };
    const args = [];
    if (headless) {
      args.push('--no-sandbox');
      args.push('--disable-setuid-sandbox');
    } else {
      args.push('--start-maximized');
      config.defaultViewport = {
        width: 1920,
        height: 1080,
      };
      config.slowMo = 10;
    }
    config.args = args;
    const browser = await puppeteer.launch(config);
    this.browser = browser;
  }

  /**
   * Log in to LinkedIn with the provided email and password from configuration.
   * @private
   */
  async login() {
    const { email, password } = linkedIn;
    try {
      this.page = await this.browser.newPage();
      await this.page.goto('https://www.linkedin.com/login');
      await this.page.waitForSelector('#username');
      await this.page.type('#username', email);
      await this.page.type('#password', password);
      await this.page.click('.btn__primary--large');
      await this.page.waitForNavigation();
      // Review the page to see if the login was successful
      const url = await this.page.url();
      if (url.includes('login-submit')) {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error(error.message);
      await this.browser.close();
    }
  }

  /**
   * Get unread conversations from the current LinkedIn page.
   * @private
   * @returns {Promise<Array>} An array of unread conversation objects.
   */
  async getUnreadConversations() {
    // Scroll the list of conversations until the end
    const scrollSelector = '.msg-conversations-container__conversations-list';
    await scroll(this.page, scrollSelector);

    const conversations = await this.page.$$(
      '.msg-conversations-container__conversations-list .msg-conversation-listitem',
    );
    const unreadConversations = [];
    for (const conversation of conversations) {
      // Review if the conversation is unread
      const isUnread = await conversation.$('.notification-badge__count');
      if (isUnread) {
        const url = await conversation.$eval(
          '.msg-conversation-listitem__link',
          (a) => a.href,
        );
        const name = await getText(
          conversation,
          '.msg-conversation-listitem__participant-names',
        );
        const newMessages = await getText(
          conversation,
          '.notification-badge__count',
        );
        unreadConversations.push({
          name,
          url,
          numberOfNewMessages: parseInt(newMessages, 10),
        });
      }
    }
    return unreadConversations;
  }

  /**
   * Get messages from a given conversation.
   * @private
   * @param {object} conversation - The conversation object containing the URL and number of new messages.
   * @returns {Promise<Array>} An array of message objects.
   */
  async getConversationMessages(conversation) {
    let { numberOfNewMessages, url } = conversation;
    const conversationMessages = [];
    await this.page.goto(url);
    await this.page.waitForSelector('.msg-s-message-list-container');
    const messages = await this.page.$$(
      '.msg-s-message-list-container .msg-s-message-list__event',
    );
    for (let i = 1; i <= numberOfNewMessages; i++) {
      const message = messages[messages.length - i];
      const text = await getText(message, '.msg-s-event-listitem__body');
      const time = await getText(message, '.msg-s-message-group__timestamp');
      const date = await getText(message, '.msg-s-message-list__time-heading');
      conversationMessages.push({ time, date, text });
    }
    return conversationMessages;
  }

  /**
   * Format the conversation messages into a string.
   * @private
   * @param {Array} messages - An array of message objects.
   * @param {string} name - The name of the conversation participant.
   * @returns {string} A formatted string of conversation messages.
   */
  getContent(messages, name) {
    let content = `The user ${name} wrote the following messages:\n`;
    for (const message of messages) {
      const { time, date, text: messageText } = message;
      content += `${date} at ${time}: ${messageText}\n`;
    }
    return content;
  }

  /**
   * Respond to unread conversations using the ChatGPT API.
   * @private
   * @param {Array} conversations - An array of unread conversation objects.
   */
  async answerUnreadConversations(conversations) {
    for (const conversation of conversations) {
      const { name } = conversation;
      const messages = await this.getConversationMessages(conversation);
      const content = this.getContent(messages, name);
      let answer = await chatCompletion(content);
      answer += `\n\nMessage generated using ChatGPT and web scrapping, more details: ${repository.url.replace(
        'git+',
        '',
      )}`;
      console.log(answer);
      await this.page.type('.msg-form__contenteditable > p', answer);
      await this.page.click('.msg-form__send-button');
    }
  }

  /**
   * Run the LinkedInClass service to log in, get unread messages, and respond using the ChatGPT API.
   */
  async run() {
    await this.getBrowser();
    await this.login();
    await this.page.goto('https://www.linkedin.com/messaging/');
    await this.page.waitForSelector(
      '.msg-conversations-container__conversations-list',
    );
    // "Priority messages"
    let unreadConversations = await this.getUnreadConversations();
    await this.answerUnreadConversations(unreadConversations);
    // "Other messages"
    await this.page.click('.msg-focused-inbox-tabs .artdeco-tab:nth-child(2)');
    unreadConversations = await this.getUnreadConversations();
    await this.answerUnreadConversations(unreadConversations);
    await this.browser.close();
  }
}

module.exports = LinkedInClass;
