# Bendatube

A simple and lightweight YouTube-style application, intended for close friends to track videos over the years and share memories.

## Features
- Video uploading and streaming
- User authentication and authorization
- Commenting and rating system
- Video search functionality
- User profile management

## Get started
- [Database connection](#database)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)

## Database

MongoDB is necessary for the application to work properly. Once installed, be sure to change the `DB_CONNECT` environment variable (in the `.env` file) to the pre-configured or modified database API. You want to start the database before running the application.

## Installation
1. Install the necessary dependencies:
```bash
npm install
```
2. Start the application
```bash
npm start
```

You may want to use a process manager like [PM2](https://pm2.keymetrics.io/) to handle any case of process crush or anomaly. It is not strictly necessarily, but it's highly recommended in production.

## Environment Variables
The `.env` file contains the following setup - you have full control of that - and the variables are needed for the application to work:
- `PORT`: Port number for the application to run on (default, 8080)
- `SESSION_STRING`: the string used in cookie generation and session creation (default, an auto-generated string)
- `DB_CONNECT`: MongoDB connection string, in order to estabilish the connection betwenn the application and the DB (default, the common case)
- `SECRET_KEY`: the secret passkey required in creating accounts, to prevent application from having undesired access. Make sure to keep it secret among your closest friends

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

If you encounter any issues or have any questions, feel free to open an issue or contact the project maintainers.
