/* eslint-disable no-console */
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const { linkedIn, headless } = require('../config');
const { getText } = require('../utils/puppeteer.util');
const { chatCompletion } = require('../utils/chatCompletion.util');

const { repository } = require('../package.json');

class LinkedInClass {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async getBrowser() {
    const config = {
      headless,
    };
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

  async getUnreadConversations() {
    // TODO: Review this method
    await this.page.goto('https://www.linkedin.com/messaging/');
    await this.page.waitForSelector(
      '.msg-conversations-container__conversations-list',
    );
    const conversations = await this.page.$$(
      '.msg-conversations-container__conversations-list .msg-conversation-listitem',
    );

    const unreadConversations = [];
    for (const conversation of conversations) {
      // Review if the conversation is unread
      const isUnread = await conversation.$(
        '.msg-conversation-card__new-messages',
      );
      if (isUnread) {
        const name = await getText(
          conversation,
          '.msg-s-event-listitem__actor-name',
        );
        const newMessages = await getText(
          conversation,
          '.msg-conversation-card__new-messages',
        );
        unreadConversations.push({
          name,
          conversation,
          numberOfNewMessages: parseInt(newMessages, 10),
        });
      }
    }
    return unreadConversations;
  }

  async getConversationMessages(conversation) {
    const conversationMessages = [];
    await conversation.click();
    await this.page.waitForSelector('.msg-s-message-list__list');
    const messages = await this.page.$$(
      '.msg-s-message-list__list .msg-s-event-listitem',
    );
    let { numberOfNewMessages: i } = conversation;
    let j = 0;
    for (; j < i; j++) {
      const message = messages[j];
      const text = await getText(message, '.msg-s-event-listitem__body');
      const time = await getText(message, '.msg-s-event-listitem__time');
      const date = await getText(
        message,
        '.msg-s-event-listitem__time-heading',
      );
      conversationMessages.push({
        time,
        date,
        text,
      });
      i -= 1;
    }
    return conversationMessages;
  }

  formatMessages(messages, name) {
    let text = `${name} wrote the following messages:\n`;
    for (const message of messages) {
      const { time, date, text: messageText } = message;
      text += `${date} at ${time}: ${messageText}\n`;
    }
    text +=
      'Reply the conversation in the same language in the best way possible';
    text +=
      'Specify that you are an AI that helps answer unread messages on LinkedIn';
    return text;
  }

  async answerUnreadConversations(conversations) {
    for (const conversation of conversations) {
      const { name, conversation: conversationElement } = conversation;
      const messages = await this.getConversationMessages(conversationElement);
      const content = this.getContent(messages, name);
      let answer = await chatCompletion(content);
      answer += `\n\n${repository.url}`;
      // await this.page.type('.msg-form__contenteditable', answer);
      // await this.page.keyboard.press('Enter');
      console.log(answer);
    }
  }

  async run() {
    await this.getBrowser();
    await this.login();
    const unreadConversations = await this.getUnreadConversations();
    await this.answerUnreadConversations(unreadConversations);
    await this.browser.close();
  }
}

module.exports = LinkedInClass;
