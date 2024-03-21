import React, { useState, useCallback } from 'react';
import {Form, FormLayout, Checkbox, TextField, Button} from '@shopify/polaris';




const StandardMerchantPage = () => {
  const [random, setRandom] = useState(Math.floor(Math.random() * 1000) + 100);
  const [signature, setSignature] = useState('');
  const [email, setEmail] = useState('');
  const [cardSecurity, setCardSecurity] = useState('100');
  const [cardNumber, setCardNumber] = useState('4508750015741019');
  const [expiryDate, setExpiryDate] = useState('3901');
  const [cardHolderName] = useState("Tom Hooker");


  // Form data without sensitive information for signature generation
  const [formData, setFormData] = useState({
    access_code: 'TVuGLbaqP5kPRop5EXJW',
    language: 'en',
    merchant_identifier: '61450fb3',
    merchant_reference: 'merch-120',
    service_command: 'TOKENIZATION',
    return_url: 'http://localhost:57252',
  });

  // Sensitive information to be appended just before form submission
  const sensitiveData = {
    card_security_code: '100',
    card_number: '4508750015741019',
    expiry_date: '0139',
    card_holder_name: 'Tom Hooker',
  };

  const generateSignature = async () => {
    const sortedKeys = Object.keys(formData).sort();
    let requestString = '45NIzv9czzZ4i/ELIzgAbB!)';
    sortedKeys.forEach(key => {
      requestString += `${key}=${formData[key]}`;
    });
    requestString += '45NIzv9czzZ4i/ELIzgAbB!)';

    const encoder = new TextEncoder();
    const data = encoder.encode(requestString);
    const hashed = await crypto.subtle.digest('SHA-256', data);
    const signature = Array.from(new Uint8Array(hashed))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return signature.toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const signature = await generateSignature();
    const fullData = { ...formData, signature, ...sensitiveData, };

    // Construct the FormData object for submission
    const submissionFormData = new FormData();
    Object.entries(fullData).forEach(([key, value]) => {
      submissionFormData.append(key, value);
    });

    // Submit the form data with the sensitive information and signature
    try {
      const response = await fetch('https://sbcheckout.payfort.com/FortAPI/paymentPage', {
        method: 'POST',
        body: submissionFormData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Handle the successful submission here
      console.log('Form submitted successfully');
    } catch (error) {
      console.error('There was an error submitting the form:', error);
    }
  };


  //Set Form Input Values
 
  const handleValueChange = useCallback((e => {
    
  
    switch (e.target.name) {
      case 'card_security_code':
        setCardSecurity(e.target.value);
    }

  }));


  const placeHolderOnChange = useCallback((value)=> "woo");


  //styles
  const inputContainer = {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    width: "35%",
    margin: "auto auto",
    marginTop: "2rem"
  }

  const inputField = {
    marginBottom: "1rem",
    height: "2.5rem",
    fontFamily: "Inter"
  }


 


  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Merchant Page iFrame</h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <iframe
          style={{ border: '6px dotted green' }}
          name="myframe"
          src=""
          width="600"
          height="500"
          title="Payment Form"
        ></iframe>
      </div>
      <form
          action="https://sbcheckout.payfort.com/FortAPI/paymentPage"
          method="post"
          target="_self"
        >
          <div style={inputContainer}>
          <input type="hidden" onChange={placeHolderOnChange} name="service_command" value="TOKENIZATION" />
          <input type="hidden" onChange={placeHolderOnChange} name="access_code" value="TVuGLbaqP5kPRop5EXJW" />
          <input type="hidden" onChange={placeHolderOnChange} name="language" value="en" />
          <input type="hidden" onChange={placeHolderOnChange} name="merchant_identifier" value="61450fb3" />
          <input type="hidden" onChange={placeHolderOnChange} name="merchant_reference" value={`merch${random}`} />
          <input type="hidden" onChange={placeHolderOnChange} name="return_url" value="http://localhost:54435/home" />
          <input type="hidden" onChange={placeHolderOnChange} name="signature" value={signature} />

          <label className="inputLabel">Card Security Code</label>
          <input style={inputField} type="text" onChange={handleValueChange} name="card_security_code" value={cardSecurity} />

          <label className="inputLabel">Card Number</label>
          <input style={inputField} type="text" onChange={handleValueChange} name="card_number" value={cardNumber} />

          <label className="inputLabel">Expiry Date</label>
          <input style={inputField} type="text" onChange={handleValueChange} name="expiry_date" value={expiryDate} />

          <label className="inputLabel">Card Holder Name</label>
          <input style={inputField} type="text" onChange={handleValueChange} name="card_holder_name" value={cardHolderName} />

          <input style={inputField} type="submit" value="Show Payment Form" />
          <p style={{color: "black"}}></p>
          </div>
        </form>
    </div>
  );
};

export default StandardMerchantPage;