import React, { useState, useEffect } from 'react';
import { createServerClient } from '@supabase/auth-helpers-remix';
import { useLoaderData, useActionData } from '@remix-run/react';
import { json } from '@remix-run/node';

export const loader = async ({ request }) => {
  const response = new Response()
  const supabaseClient = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { request, response }
  )
  const { data } = await supabaseClient.from('Token').select('*')
  return json(
    { data },
  )
}

export const action = async ({ request }) => {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { request, response }
  );
  const message = await request.text();
  console.log("Message from request:", message);
  const params = new URLSearchParams(message);

  const currentDate = new Date();
  console.log("Date:", currentDate.toISOString());
  const date = currentDate.toISOString();
  const freeTrialEndDate = new Date(currentDate.getTime());
  freeTrialEndDate.setDate(currentDate.getDate() + 7);
  console.log("Free trial date:", freeTrialEndDate.toISOString());
  const freeTrialDate = freeTrialEndDate.toISOString();

  const tokenName = params.get('token_name');
  const merchReference = params.get('merchant_reference');
  const accessCode = params.get('access_code');
  const merchantIdentifier = params.get('merchant_identifier');
  if (!tokenName) {
    console.error("token_name is missing from the request.");
    return new Response("Token name is missing", { status: 400 });
  }
  const { error } = await supabase.from("Token").insert({ created_at: date, token_name: String(tokenName), merchant_reference: String(merchReference), access_code: String(accessCode), merchant_identifier: String(merchantIdentifier), free_trial: freeTrialDate });
  if (error) {
    console.error("Failed to save token:", error);
    return new Response("Failed to save token", { status: 500 });
  }

  // Generate the signature
  const requestMap = {
    access_code: accessCode,
    amount: "10",
    command: "AUTHORIZATION",
    currency: "SAR",
    customer_email: "mail@tomhooker.co.uk",
    language: "en",
    merchant_identifier: merchantIdentifier,
    merchant_reference: merchReference,
    token_name: tokenName
  }
  // Sort keys and create the string to hash
  const sortedKeys = Object.keys(requestMap).sort();
  let requestString = '45NIzv9czzZ4i/ELIzgAbB!)'; // Assuming 'PASS' is some kind of prefix/suffix for the hash
  sortedKeys.forEach(key => {
    requestString += `${key}=${requestMap[key]}`;
  });
  requestString += '45NIzv9czzZ4i/ELIzgAbB!)'; // Assuming 'PASS' is some kind of prefix/suffix for the hash

  // Hash the request string
  const encoder = new TextEncoder();
  const data = encoder.encode(requestString);
  const hashed = await crypto.subtle.digest('SHA-256', data);
  const signature = Array.from(new Uint8Array(hashed))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const signatureCaps = signature.toUpperCase(); // Set the generated signature to state

  const jsonRequestString = JSON.stringify({
    access_code: accessCode, // Update this with your actual access code
    amount: "10",
    command: "AUTHORIZATION",
    currency: "SAR",
    customer_email: "mail@tomhooker.co.uk",
    language: "en",
    merchant_identifier: merchantIdentifier, // Update this with your actual merchant identifier
    merchant_reference: merchReference,
    signature: signatureCaps, // Update this with your actual signature
    token_name: tokenName
  });
  console.log("JSON request string:", jsonRequestString);

  try {
    const response = await fetch('https://sbpaymentservices.payfort.com/FortAPI/paymentApi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonRequestString,
    });
    const responseJSON = await response.json();
    console.log("Response JSON:", responseJSON);
    return responseJSON;
  } catch (error) {
    console.error("Error making HTTP request:", error);
    return new Response("Failed to make HTTP request", { status: 500 });
  }
};

export default function StandardMerchantPage() {
  const loadData = useLoaderData();
  const actionData = useActionData();
  console.log("Loader data:", loadData);
  console.log("Action data:", actionData);
  const [signature, setSignature] = useState('');
  const [random, setRandom] = useState(Math.floor(Math.random() * 1000) + 100);
  const [iframeUrl, setIframeUrl] = useState('');

  useEffect(() => {
    if (actionData && actionData['3ds_url']) {
      console.log("3DS URL:", actionData['3ds_url']);
      setIframeUrl(actionData['3ds_url']);
    }
  }, [actionData]);

  useEffect(() => {
    const generateSignature = async () => {
      const requestMap = {
        access_code: 'TVuGLbaqP5kPRop5EXJW',
        language: 'en',
        merchant_identifier: '61450fb3',
        merchant_reference: `merch${random}`,
        service_command: 'TOKENIZATION',
        return_url: 'http://localhost:54435/home',
      };
      console.log("Request map:", requestMap);
      // Sort keys and create the string to hash
      const sortedKeys = Object.keys(requestMap).sort();
      let requestString = '45NIzv9czzZ4i/ELIzgAbB!)'; // Assuming 'PASS' is some kind of prefix/suffix for the hash
      sortedKeys.forEach(key => {
        requestString += `${key}=${requestMap[key]}`;
      });
      requestString += '45NIzv9czzZ4i/ELIzgAbB!)'; // Assuming 'PASS' is some kind of prefix/suffix for the hash
      // Hash the request string
      const encoder = new TextEncoder();
      const data = encoder.encode(requestString);
      const hashed = await crypto.subtle.digest('SHA-256', data);
      const signature = Array.from(new Uint8Array(hashed))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      setSignature(signature.toUpperCase()); // Set the generated signature to state
    };
    generateSignature();
    console.log("Signature:", signature);
  }, [random]);
  console.log("Random:", random);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <iframe
          style={{ border: '6px dotted green' }}
          name="myframe"
          src={iframeUrl}
          width="600"
          height="500"
          title="Payment Form"
        ></iframe>
      </div>
      <div>
        <form
          action="https://sbcheckout.payfort.com/FortAPI/paymentPage"
          method="post"
          target="_self"
        >
          <input type="hidden" readOnly name="service_command" value="TOKENIZATION" />
          <input type="hidden" readOnly name="access_code" value="TVuGLbaqP5kPRop5EXJW" />
          <input type="hidden" readOnly name="language" value="en" />
          <input type="hidden" readOnly name="merchant_identifier" value="61450fb3" />
          <input type="hidden" readOnly name="merchant_reference" value={`merch${random}`} />
          <input type="hidden" readOnly name="return_url" value="http://localhost:54435/home" />
          <input type="hidden" readOnly name="signature" value={signature} />

          <input type="text" readOnly name="card_security_code" value="100" />
          <input type="text" readOnly name="card_number" value="4508750015741019" />
          <input type="text" readOnly name="expiry_date" value="3901" />
          <input type="text" readOnly name="card_holder_name" value="Tom Hooker" />
          <input type="submit" readOnly value="Show Payment Form" />
          <p style={{color: "black"}}></p>
        </form>
      </div>
    </>
  );
};