# WriteNForget

Welcome to WriteNForget, the ultimate space to pen down your thoughts and let go. Our platform is designed for those who want to express themselves freely without the pressure of permanence. Here, you can write your thoughts and forget them, creating a digital journal, diary, blog, or note collection that is both private and liberating.

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Notes](#notes)

## Project Description

At WriteNForget, we believe in the power of expression and the freedom that comes with it. Whether you are jotting down memories, drafting posts, or simply organizing your ideas, our site offers a seamless and secure environment to do so. Our mission is to provide you with a tool that helps you capture your thoughts effortlessly and move forward without the need to hold on to them.

Join our community of writers, thinkers, and dreamers. Share your thoughts, let them flow, and embrace the peace of mind that comes with writing and forgetting.

## Features

- Create an account
- Login
- Write a post
- Like a post
- Comment on a post
- Repost
- Publish posts
- Search for posts and users
- Edit profile
- List all posts
- View individual posts

## Tech Stack

- **Node.js**: JavaScript runtime for building the backend.
- **Prisma**: ORM for database management.
- **TypeScript**: Superset of JavaScript for static typing.
- **EJS**: Templating engine for generating HTML markup.
- <a href='https://render.com/'>**Render**: Hosting service for the application.</a>
- <a href='https://aiven.io/'>**Aiven**: Database hosting service.</a>
- **Google Analytics**: just for the experience.

## Installation

To get started with the project, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/jmatoso/WriteNForget.git
    cd WriteNForget
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up environment variables:

    Create a `.env` file in the root of the project and add the following variables:
    ```env
    DATABASE_URL="your-aiven-database-url"
    SECRET="your-session-secret"
    NODE_ENV="development"
    MAX_AGE=86400
    ```

4. Run database migrations:
    ```sh
    npx prisma migrate dev
    ```

## Usage

To start the development server, run:
```sh
npm run dev
```

The application will be available at `http://localhost:3000`.

## Deployment

The site is hosted on Render and the database on Aiven. Follow these steps for deployment:

1. Set up your Render account and create a new web service.
2. Link your GitHub repository to Render.
3. Add the required environment variables in Render's dashboard.
4. Deploy the application directly from the Render dashboard.

<p>or</p>

<a href="https://render.com/deploy?repo=https://github.com/JMatoso/WriteNForget">
    <img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render" />
</a>

## Notes

This project is used for my studies in Node.js and related technologies. Feel free to use and modify the code for your learning purposes.
