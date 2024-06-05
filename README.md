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
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Database

MongoDB is necessary for the application to work properly. Once installed, be sure to change the `DB_CONNECT` environment variable to the pre-configured or modified database API. You want to start the database before running the application.

## Installation
- external configuration:
sinasofs
- installation
1. Install the necessary dependencies:
```bash
npm install
```
2. Start the application
```bash
npm start
```

## Usage
To start the application, use:
```bash
npm start
```

## Environment Variables
This application requires an `.env` file to run. The `.env` file should contain the following sensitive information:
- `MONGO_URI`: MongoDB connection string
- `PORT`: Port number for the application to run on (default is 3000)

Example `.env` file:
```
MONGO_URI=mongodb://username:password@host:port/database
PORT=3000
```

**Note:** Ensure that your `.env` file is not committed to version control as it contains sensitive information.

## Dependencies
- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [dotenv](https://www.npmjs.com/package/dotenv)

For a full list of dependencies, refer to the `package.json` file.

## Contributing
We welcome contributions! Please follow these steps to contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a pull request.

Please ensure your code adheres to the project's coding standards and is properly tested.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

If you encounter any issues or have any questions, feel free to open an issue or contact the project maintainers.
