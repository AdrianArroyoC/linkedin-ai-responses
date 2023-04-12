# LinkedIn AI Responses

A Node.js project that uses node-cron to schedule web scraping tasks on LinkedIn, retrieve messages, and generate responses using ChatGPT API.

## Features

This Node.js project automates the process of logging in to LinkedIn, retrieving unread messages from the user's inbox, and generating responses using OpenAI's ChatGPT. The application utilizes web scraping with Puppeteer, scheduling tasks with node-cron, and interacting with the OpenAI API for generating responses. The following is a detailed description of each step:

1. Scheduling: The application uses node-cron to schedule tasks at specific intervals (e.g., every hour) to check for new unread messages on LinkedIn. The cron expression can be defined in the .env file using the CRON variable.

2. LinkedIn Login: Puppeteer is used to automate browser actions for logging into the LinkedIn account using the provided credentials. It navigates to the LinkedIn login page, enters the email and password, and submits the form.

3. Fetching Unread Messages: After logging in, the application navigates to the LinkedIn messaging page and iterates through the list of conversations, identifying the ones with unread messages. It retrieves the sender's name, the URL of the conversation, and the number of new messages.

4. Reading Messages: For each conversation with unread messages, the application visits the conversation URL, extracts the text content of the new messages along with their timestamps and dates, and stores this information for further processing.

5. Generating Responses: The application uses OpenAI's ChatGPT API to generate responses to the unread messages. It sends the text content of the new messages along with any predefined system and user instructions to the ChatGPT API, which returns an appropriate response.

6. Sending Replies: The generated responses are sent as replies to the corresponding conversations on LinkedIn. The responses include a note mentioning that they were generated using ChatGPT and web scraping, along with the repository URL.

7. Cleanup: After processing all the unread messages and sending responses, the application closes the browser instance and awaits the next scheduled task.

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/AdrianArroyoC/linkedin-ai-responses.git
   cd linkedin-ai-responses
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory of the project based on the provided `env.example` file. Fill in the appropriate values for your LinkedIn credentials, OpenAI API key, and other required settings.

4. Start the server:

   ```bash
   npm start
   ```

5. The application will now run scheduled tasks based on your configured cron expression to scrape LinkedIn messages and generate AI-based responses using ChatGPT.

## Scripts

- `npm start`: Run the server
- `npm run start:debug`: Run the server with watch and inspect flags for debugging
- `npm run lint`: Run ESLint on the project
- `npm run lint:fix`: Run ESLint with automatic fix option
- `npm run format`: Run Prettier on the project
- `npm run format:write`: Run Prettier with the write option to format files in-place
- `npm run husky:config`: Configure Husky and set up the pre-commit hook

## Deployment and Environment Variables

This section explains how to deploy the application to the Google Cloud Platform using App Engine Flex.

### Prerequisites

Before you start, make sure you have:

1. A Google Cloud Platform account and project.

2. Google Cloud SDK installed on your local machine. You can follow the official guide to install the SDK.

3. Logged in to your GCP account using the command gcloud auth login.

### Environment Variables

For deployment, depending on the environment, the .env files must end with .<environment>, for example, .env.prod or .env.production. This must be specified in the NODE_ENV variable inside the app.yaml file.

For example, if you are deploying to a production environment, update the app.yaml file with the following environment variable:

```yaml
env_variables:
  NODE_ENV: 'production'
```

Make sure to create the corresponding .env.production file with the required environment variables.

### Deployment Steps

1. Update the app.yaml file with the appropriate environment variables and configurations based on your requirements and the desired environment.

2. Navigate to the root directory of your project in the terminal.

3. Deploy your application to App Engine using the following command:

   ```bash
   gcloud app deploy app.yaml
   ```

This command will deploy your application using the configurations specified in the app.yaml file. It might take some time for the deployment to complete.

4. Once the deployment is successful, you can view your application by visiting the URL displayed in the terminal or by running the following command:

   ```bash
   gcloud app browse
   ```

This command will open the default web browser and navigate to the deployed application.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
