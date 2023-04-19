/**
 * @fileoverview LinkedInClass provides a service to automate LinkedIn message responses using web scraping and the ChatGPT API.
 */

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
      // eslint-disable-next-line no-console
      console.error(error.message);
      await this.browser.close();
    }
  }

  /**
   * Review the first conversation to see if the last message is from the user.
   * @private
   * @returns {Array} An array of conversation objects.
   */
  async addFirstConversation() {
    const conversation = await this.page.$(
      '.msg-conversations-container__conversations-list .msg-conversation-listitem',
    );
    const name = await getText(
      conversation,
      '.msg-conversation-listitem__participant-names',
    );
    const messages = await this.page.$$(
      '.msg-s-message-list-container .msg-s-message-list__event',
    );
    const message = messages.at(-1);
    const lastMessageName = await getText(
      message,
      '.msg-s-message-group__profile-link',
    );
    return lastMessageName.startsWith(name);
  }

  /**
   * Get the conversation data from a given conversation.
   * @private
   * @param {object} conversation - The conversation object.
   * @returns {object} An object containing the conversation data.
   */
  async getConversationData(conversation, firstConversation = false) {
    // Error Here
    const url = await conversation.$eval(
      '.msg-conversation-listitem__link',
      (a) => a.href,
    );
    const name = await getText(
      conversation,
      '.msg-conversation-listitem__participant-names',
    );
    let newMessages = 1;
    if (!firstConversation) {
      newMessages = await getText(conversation, '.notification-badge__count');
    }
    return {
      name,
      url,
      numberOfNewMessages: parseInt(newMessages, 10),
    };
  }

  /**
   * Get unread conversations from the current LinkedIn page.
   * @private
   * @param {boolean} firstConversation - Look for the first conversation.
   * @returns {Array} An array of unread conversation objects.
   */
  async getUnreadConversations(firstConversation = true) {
    const unreadConversations = [];
    if (firstConversation) {
      const firstConversation = await this.addFirstConversation();
      if (firstConversation) {
        const { name, url, numberOfNewMessages } =
          await this.getConversationData(firstConversation, true);
        unreadConversations.push({
          name,
          url,
          numberOfNewMessages,
        });
      }
    }

    // Scroll the list of conversations until the end
    const scrollSelector = '.msg-conversations-container__conversations-list';
    await scroll(this.page, scrollSelector);

    const conversations = await this.page.$$(
      '.msg-conversations-container__conversations-list .msg-conversation-listitem',
    );
    for (const conversation of conversations) {
      const isUnread = await conversation.$('.notification-badge__count');
      if (isUnread) {
        const { name, url, numberOfNewMessages } =
          await this.getConversationData(conversation);
        unreadConversations.push({
          name,
          url,
          numberOfNewMessages,
        });
      }
    }
    return unreadConversations;
  }

  /**
   * Get messages from a given conversation.
   * @private
   * @param {object} conversation - The conversation object containing the URL and number of new messages.
   * @returns {Array} An array of message objects.
   */
  async getConversationMessages(conversation) {
    const { numberOfNewMessages } = conversation;
    const conversationMessages = [];
    const messages = await this.page.$$(
      '.msg-s-message-list-container .msg-s-message-list__event',
    );
    for (let i = 1; i <= numberOfNewMessages; i++) {
      const message = messages[messages.length - i];
      const text = await getText(message, '.msg-s-event-listitem__body');
      const timeSelector = '.msg-s-event-listitem__timestamp';
      const timeElement = await message.$(timeSelector);
      // Get just the time from the timestamp
      const currentDate = new Date();
      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();
      let time = `${hours}:${minutes}`;
      if (timeElement) {
        time = await getText(message, '.msg-s-message-group__timestamp');
      }
      const dateSelector = '.msg-s-message-list__time-heading';
      const dateElement = await message.$(dateSelector);
      let date = 'TODAY';
      if (dateElement) {
        date = await getText(message, dateSelector);
        conversationMessages.push({ time, date, text });
      }
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
   * Go to each unread conversation and respond it if possible using AI.
   * @private
   * @param {Array} conversations - An array of unread conversation objects.
   */
  async answerUnreadConversations(conversations) {
    for (const conversation of conversations) {
      const { url } = conversation;
      await this.page.goto(url);
      await this.page.waitForSelector('.msg-s-message-list-container');
      const textBox = await this.page.$('.msg-form__contenteditable > p');
      if (textBox) {
        const { name } = conversation;
        const messages = await this.getConversationMessages(conversation);
        const content = this.getContent(messages, name);
        await textBox.click();
        await this.answerConversation(content);
      }
    }
  }

  /**
   * Answer a conversation with a message generated using AI.
   * @param {string} content - The message content that will be used to generate the response.
   */
  async answerConversation(content) {
    let answer = await chatCompletion(content);
    answer = answer
      .replace(/\[en\]/g, 'Auto generated message using AI, more details: ')
      .replace(/\[es\]/g, 'Mensaje auto generado usando IA, mas detalles: ');
    const repositoryUrl = repository.url.replace('git+', '');
    answer += `${repositoryUrl}`;
    await this.page.type('.msg-form__contenteditable > p', answer);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await this.page.click('.msg-form__send-button');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const modalCloseButton = await this.page.$('.artdeco-modal__dismiss');
    if (modalCloseButton) {
      await modalCloseButton.click();
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
    unreadConversations = await this.getUnreadConversations(false);
    await this.answerUnreadConversations(unreadConversations);
    await this.browser.close();
  }
}

module.exports = LinkedInClass;
