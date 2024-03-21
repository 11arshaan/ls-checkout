// Import necessary modules
import { json } from "@remix-run/node";
import crypto from 'crypto';
import fetch from 'node-fetch';

// Function to generate a signature based on the payload and a passphrase
function generateSignature(parameters, passphrase) {
    // Sort parameters in ascending alphabetical order
    const sortedParams = Object.keys(parameters).sort().reduce((result, key) => {
        result[key] = parameters[key];
        return result;
    }, {});

    // Concatenate param name and value, then add passphrase at the beginning and end
    let baseString = Object.entries(sortedParams).map(([key, value]) => `${key}=${value}`).join(''); 
    baseString = passphrase + baseString + passphrase;

    // Generate SHA256 hash of the base string
    return crypto.createHash('sha256').update(baseString).digest('hex');
}

// Function to organize payload information in alphabetical order
function sortPayload(payload) {
    return Object.keys(payload).sort().reduce((obj, key) => {
        obj[key] = payload[key];
        return obj;
    }, {});
}

// Function to call the API
async function callAPI(unsortedPayload, passphrase, baseUrl) {
    // Generate signature with the initial payload
    unsortedPayload.signature = generateSignature(unsortedPayload, passphrase);

    // Add card details to the payload
    let payloadWithCardDetails = {
        ...unsortedPayload,
        card_number: "4508750015741019",
        expiry_date: "0139",
        card_holder_name: "John Doe",
        card_security_code: "100"
    };

    // Sort the entire payload, now including card details
    let sortedPayload = sortPayload(payloadWithCardDetails);

    // Endpoint URL
    const endPoint = `https://${baseUrl}/FortAPI/paymentApi`;

    // Define fetch options
    let fetchOptions = {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sortedPayload) // Use the sorted payload
    };

    try {
        const response = await fetch(endPoint, fetchOptions);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Response:", errorText);
            return json({ error: true, status: response.status, message: errorText });
        }
        return json(await response.json());
    } catch (error) {
        console.error("Error calling the API:", error);
        return json({ error: error.message }, { status: 500 });
    }
}

// Example usage within a Remix loader or action
export const loader = async ({ request }) => {
    // Initial payload structure
    let payload = {
        service_command: "AUTHORIZATION",
        access_code: "TVuGLbaqP5kPRop5EXJW",
        merchant_identifier: "61450fb3",
        merchant_reference: "merchanttest-102240",
        language: "en"
        // Card details added here if part of the initial payload
    };

    // Constants for this request
    const passphrase = "45NIzv9czzZ4i/ELIzgAbB!)";
    const baseUrl = "sbcheckout.PayFort.com"; // or your API's base URL

    try {
        const response = await callAPI(payload, passphrase, baseUrl);
        return response;
    } catch (error) {
        console.error("Error in loader:", error);
        return json({ error: error.message }, { status: 500 });
    }
};