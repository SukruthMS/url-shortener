# URL Shortener Project

## Introduction

Service to shorten long, hard to remember URLs into easy to share shortened re-directs.

## Tech Stack Used
- Node.js
- Express.js
- MongoDB

## Setup Instructions

### Prerequisites

- Node.js installed
- MongoDB installed and running

### Running the Project Locally

1. Clone the repository
2. Install Node.js modules: `npm install`
3. Create a `.env` file based on `.env`
4. Start the server: `npm start`

## API Documentation

### User Routes

### Register a User

- POST /user/register

- Body:
- username (String, required): Username of the user.
- tier (Number, required): Tier of the user (1-5).

- Response:
- 201: User registered successfully.
- 400: Bad request if username or tier is missing/invalid.
- 409: User already exists.

### Get User Information

- GET /user/info

- Query Params:
- username (String, required): Username of the user.

- Response:
- 200: Returns user information.
- 400: Bad request if username is missing.
- 404: User not found.

## URL Routes

### Shorten a URL

- POST /url/shorten

- Body:

- username (String, required): Username of the user requesting URL shortening.
- longUrl (String, required): The original URL to be shortened.
- preferredShortId (String, optional): Preferred short ID for the URL.

- Response:
- 200: Returns shortened URL.
- 400: Bad request if required fields are missing or invalid.
- 429: User's request limit reached.

### Get URL History

- GET /url/history

- Query Params:
- username (String, required): Username of the user.

- Response:
- 200: Returns a list of URLs shortened by the user.
- 400: Bad request if username is missing.
- 404: No URLs found for the user.

## Redirection Routes

### Redirect to Long URL

- GET /:shortId

- Path Params:
- shortId (String, required): Shortened ID of the URL.

- Response:
- 302: Redirects to the original long URL.
- 404: URL not found.
- 500: Internal server error.

## Testing

- To run tests, use the following command: