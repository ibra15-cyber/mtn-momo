Here's the documentation for the provided code:

---

# MTN Payment Integration API Documentation

## Overview

This Node.js application uses the Express framework to expose an endpoint for integrating with the MTN Mobile Money API. It facilitates payment requests through MTN's API, handles API user creation, API key generation, token retrieval, and optional account balance checks.

## Prerequisites

- **Node.js**: Ensure Node.js is installed on your machine.
- **Environment Variables**: Create a `.env` file in the project root with the following variables:
  - `OCP_APIM_SUBSCRIPTION_KEY`: The subscription key for the MTN API.
  - `AUTHORIZATION_TOKEN`: (Optional) A bearer token if needed.
  - `xReferenceIdMerchant`: The merchant's X-Reference-Id.

## Dependencies

- `express`: A web framework for Node.js.
- `axios`: A promise-based HTTP client for the browser and Node.js.
- `cors`: A middleware for enabling Cross-Origin Resource Sharing.
- `dotenv`: A module to load environment variables from a `.env` file.
- `uuid`: A library to generate unique identifiers (UUIDs).

## Setup

1. **Install Dependencies**:
   ```bash
   npm install express axios cors dotenv uuid
   ```

2. **Create `.env` File**: In the root directory of your project, create a `.env` file with the following content:
   ```env
   OCP_APIM_SUBSCRIPTION_KEY=your_subscription_key
   AUTHORIZATION_TOKEN=your_authorization_token
   xReferenceIdMerchant=your_merchant_x_reference_id
   ```

## Code Breakdown

### Importing Modules

```javascript
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
```

- **`express`**: Web framework for Node.js.
- **`axios`**: HTTP client for making API requests.
- **`cors`**: Middleware for handling CORS.
- **`dotenv`**: For loading environment variables.
- **`uuid`**: For generating unique IDs.

### Configuration

```javascript
dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
```

- **`dotenv.config()`**: Loads environment variables from the `.env` file.
- **`app.use(cors())`**: Enables CORS.
- **`app.use(express.json())`**: Parses incoming JSON requests.

### Endpoint Definition

#### `POST /api/mtn`

```javascript
app.post("/api/mtn", async (req, res) => {
  try {
    let { amount, currency, externalId, payer, payerMessage, payeeNote } = req.body;

    const xReferenceIdCustomer = uuidv4(); // Generate customer reference ID
    const xReferenceIdMerchant = uuidv4(); // Generate merchant reference ID
    console.log(xReferenceIdCustomer);
```

- **`xReferenceIdCustomer`** and **`xReferenceIdMerchant`**: Unique IDs for customer and merchant respectively.

##### Step 1: Create API User

```javascript
    const apiUserResponse = await axios.post(
      "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser",
      {
        providerCallbackHost: "https://webhook.site/cca6bd44-43b1-4e6a-90a0-ecb31512d4a8",
      },
      {
        headers: {
          "X-Reference-Id": xReferenceIdMerchant,
          "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
        },
      }
    );
```

- **`providerCallbackHost`**: The URL where MTN will send callback notifications.
- Logs API user creation status and response.

##### Step 2: Generate API Key

```javascript
    const apiKeyResponse = await axios.post(
      `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${xReferenceIdMerchant}/apikey`,
      null,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
        },
      }
    );

    const apiKey = apiKeyResponse.data.apiKey; // Extract API key
```

- Generates an API key for the created API user.
- Logs the API key response.

##### Step 3: Generate Bearer Token

```javascript
    const tokenResponse = await axios.post(
      "https://sandbox.momodeveloper.mtn.com/collection/token/",
      null,
      {
        headers: {
          "X-Reference-Id": process.env.xReferenceIdMerchant,
          "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
          Authorization: `Basic ${Buffer.from(
            `${xReferenceIdMerchant}:${apiKey}`
          ).toString("base64")}`,
        },
      }
    );

    const bearerToken = tokenResponse.data.access_token; // Extract bearer token
```

- Retrieves a bearer token for authenticating requests.
- Logs the token response.

##### Step 4: Request Payment

```javascript
    const paymentResponse = await axios.post(
      "https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay",
      {
        amount,
        currency,
        externalId,
        payer,
        payerMessage,
        payeeNote,
      },
      {
        headers: {
          "X-Reference-Id": `${xReferenceIdCustomer}`,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    console.log("Request to Pay Response status:", paymentResponse.status);
    console.log("Request to Pay Response text:", paymentResponse.statusText);
```

- Sends a payment request using the MTN API.
- Logs the response from the payment request.

##### Step 5 (Optional): Get Account Balance

```javascript
    const balanceResponse = await axios.get(
      "https://sandbox.momodeveloper.mtn.com/collection/v1_0/account/balance",
      {
        headers: {
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    console.log("Account Balance Response status:", balanceResponse.status);
    console.log("Account Balance Response status Text:", balanceResponse.statusText);
    console.log("Account Balance Response data:", balanceResponse.data);
```

- Retrieves the account balance (optional).
- Logs the response from the balance request.

### Error Handling

```javascript
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
```

- Catches and logs any errors.
- Responds with a 500 status code and error message.

### Server Initialization

```javascript
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
```

- Starts the server on port 3001 and logs the server URL.

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Make a POST request to `http://localhost:3001/api/mtn` with the following JSON payload:
   ```json
   {
     "amount": "10",
     "currency": "USD",
     "externalId": "unique_external_id",
     "payer": "payer_number",
     "payerMessage": "Payment for invoice",
     "payeeNote": "Thank you for your business"
   }
   ```

## Notes

- **Sandbox Environment**: The provided endpoints and credentials are for the MTN sandbox environment. Replace these with production URLs and credentials for live deployments.
- **Security**: Ensure sensitive data such as `OCP_APIM_SUBSCRIPTION_KEY` and `AUTHORIZATION_TOKEN` are kept secure.

---

Feel free to adjust any details according to your specific implementation or additional requirements.
