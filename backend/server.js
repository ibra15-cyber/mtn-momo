import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post("/api/mtn", async (req, res) => {
  try {
    let { amount, currency, externalId, payer, payerMessage, payeeNote } =
      req.body;

    // Generate unique X-Reference-Id using UUID v4
    const xReferenceIdCustomer = uuidv4(); // customer id
    const xReferenceIdMerchant = uuidv4(); // product owner id
    console.log(xReferenceIdCustomer);

    // Step 1: Create API User
    const apiUserResponse = await axios.post(
      "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser",
      {
        providerCallbackHost:
          "https://webhook.site/cca6bd44-43b1-4e6a-90a0-ecb31512d4a8",
      },
      {
        headers: {
          "X-Reference-Id": xReferenceIdMerchant,
          "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
        },
      }
    );

    console.log("API User Response Status:", apiUserResponse.status); // Log the HTTP status code
    console.log("API User Response StatusText:", apiUserResponse.statusText); // Log the HTTP status code
    // console.log("API User Response:", apiUserResponse);

    // Step 2: Generate API Key
    const apiKeyResponse = await axios.post(
      `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${xReferenceIdMerchant}/apikey`,
      null,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
          // Authorization: `Bearer ${process.env.AUTHORIZATION_TOKEN}`,
        },
      }
    );

    console.log("API Key Response:", apiKeyResponse.data);

    const apiKey = apiKeyResponse.data.apiKey; // Extract API key from the response

    // Step 3: Generate Bearer Token
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

    console.log("Token Response:", tokenResponse.data);
    const bearerToken = tokenResponse.data.access_token; // Extract bearer token from the response

    // Step 4: Request Payment
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

    // Step 5 (Optional): Get Account Balance
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
    console.log(
      "Account Balance Response status Text:",
      balanceResponse.statusText
    );
    console.log("Account Balance Response data:", balanceResponse.data);

    res.json({ message: "All requests completed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
