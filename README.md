# CenterGuessr

How well do you know the CDTM students? A fun game to test your knowledge. Vibe coded this project with [Cursor](https://cursor.com).

## Running the Game Locally

Follow these steps to run the game locally on your machine.

### 1. Install Node.js

If you don't already have Node.js installed, you'll need to do so. Node.js is a JavaScript runtime that allows you to execute JavaScript code directly on your machine, without the need for a browser. The web server of Next.js, which this game uses, is written in TypeScript, hence the need for Node.js.

You can download Node.js from the official website: https://nodejs.org/

### 2. Clone the Repository

Clone the game's repository to your local machine. If you're unfamiliar with git or cloning repositories, there are many resources available online to guide you through the process.

### 3. Obtain an API Key for the CMS

To interact with the game's Content Management System (CMS), you'll need an API key. Here's how to get one:

1. **Login to the CMS**: Visit https://cms.cdtm.com and log in using your CDTM Google account.

1. **Access the User Directory**: On the left-hand sidebar, click on User Directory.

1. **Access the Applications Role**: Click on the `Applications` role. This role has read-only access to all CMS data. It's the same role that the deployed game uses (the `Game Server` user).

1. **Create a New User**: Click on the plus icon in the top-right corner to create a new user. Set your first and last name as the user's first and last name. Add a tag named local to the Tags field.

1. **Generate an API Key**: Click on the plus icon in the Token field, which is located at the bottom of the page. This will generate your API key.

### 4. Create an `.env.local` File

Create a new file named `.env.local` at the root of the cloned repository. In this file, add your API key as follows:

```
NEXT_PUBLIC_CMS_URL="https://cms.cdtm.com"
DIRECTUS_API_KEY="your_API_key"
```

Replace `your_API_key` with the API key you obtained in the previous step.

### 5. Install the dependencies

Run the following command from the root of the repository to install all required dependencies like React and Next.js:

```
npm install
```

### 6. Run the Game

In your terminal, navigate to the root directory of the cloned repository and run the following command:

```bash
npm run dev
```

This command will start the game's development server.

### 7. View the Game

Finally, open your web browser and visit `localhost:3000` to view the game.

That's it! You've successfully set up and run the game on your local machine.

# Next steps

### Update your git email address

Set your CDTM email address as your git commit email address. At the root of the cloned directory run the following with your email address:

```bash
git config user.email "first.last@cdtm.com"
```

### Install useful Plugins

If you are using Visual Studio Code as your IDE, following plugins are recommended:

#### [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

> Tailwind CSS IntelliSense enhances the Tailwind development experience by providing Visual Studio Code users with advanced features such as autocomplete, syntax highlighting, and linting.

#### [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

> Prettier is an opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules that take the maximum line length into account, wrapping code when necessary.
