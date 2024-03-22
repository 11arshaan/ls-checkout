import React, { useState, useCallback } from 'react'
import '@shopify/polaris/build/esm/styles.css'
import {
  AppProvider,
  Form,
  FormLayout,
  Checkbox,
  TextField,
  Page,
  LegacyCard,
  Button,
  Card,
  InlineStack,
} from '@shopify/polaris'

const StandardMerchantPage = () => {
  const [random, setRandom] = useState(Math.floor(Math.random() * 1000) + 100)
  const [signature, setSignature] = useState('')
  const [email, setEmail] = useState('')
  const [cardSecurity, setCardSecurity] = useState('100')
  const [cardNumber, setCardNumber] = useState('4508750015741019')
  const [expirationDate, setExpirationDate] = useState('3901')
  const [cardHolderName, setCardholderName] = useState('Tom Hooker')

  // Form data without sensitive information for signature generation
  const [formData, setFormData] = useState({
    access_code: 'TVuGLbaqP5kPRop5EXJW',
    language: 'en',
    merchant_identifier: '61450fb3',
    merchant_reference: 'merch-120',
    service_command: 'TOKENIZATION',
    return_url: 'http://localhost:57252',
  })

  // Sensitive information to be appended just before form submission
  const sensitiveData = {
    card_security_code: '100',
    card_number: '4508750015741019',
    expiry_date: '0139',
    card_holder_name: 'Tom Hooker',
  }

  const generateSignature = async () => {
    const sortedKeys = Object.keys(formData).sort()
    let requestString = '45NIzv9czzZ4i/ELIzgAbB!)'
    sortedKeys.forEach(key => {
      requestString += `${key}=${formData[key]}`
    })
    requestString += '45NIzv9czzZ4i/ELIzgAbB!)'

    const encoder = new TextEncoder()
    const data = encoder.encode(requestString)
    const hashed = await crypto.subtle.digest('SHA-256', data)
    const signature = Array.from(new Uint8Array(hashed))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return signature.toUpperCase()
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const signature = await generateSignature()
    const fullData = { ...formData, signature, ...sensitiveData }

    // Construct the FormData object for submission
    const submissionFormData = new FormData()
    Object.entries(fullData).forEach(([key, value]) => {
      submissionFormData.append(key, value)
    })

    // Submit the form data with the sensitive information and signature
    try {
      const response = await fetch(
        'https://sbcheckout.payfort.com/FortAPI/paymentPage',
        {
          method: 'POST',
          body: submissionFormData,
        },
      )

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      // Handle the successful submission here
      console.log('Form submitted successfully')
    } catch (error) {
      console.error('There was an error submitting the form:', error)
    }
  }

  //Set Form Input Values

  const invisibleStyle = { display: 'none' }
  const placeHolderOnChange = useCallback(value => 'woo')

  return (
    <Page narrowWidth>
     
       
        <Form
          onSubmit={handleSubmit}
          // action="https://sbcheckout.payfort.com/FortAPI/paymentPage"
          // method="post"
          // target="_self"
        >
          <input
            type="hidden"
            style={{ display: 'none' }}
            onChange={placeHolderOnChange}
            name="service_command"
            value="TOKENIZATION"
          />
          <input
            type="hidden"
            style={{ display: 'none' }}
            onChange={placeHolderOnChange}
            name="access_code"
            value="TVuGLbaqP5kPRop5EXJW"
          />
          <input
            type="hidden"
            style={{ display: 'none' }}
            onChange={placeHolderOnChange}
            name="language"
            value="en"
          />
          <input
            type="hidden"
            style={{ display: 'none' }}
            onChange={placeHolderOnChange}
            name="merchant_identifier"
            value="61450fb3"
          />
          <input
            type="hidden"
            style={{ display: 'none' }}
            onChange={placeHolderOnChange}
            name="merchant_reference"
            value={`merch${random}`}
          />
          <input
            type="hidden"
            style={{ display: 'none' }}
            onChange={placeHolderOnChange}
            name="return_url"
            value="http://localhost:54435/home"
          />
          <input
            type="hidden"
            style={{ display: 'none' }}
            onChange={placeHolderOnChange}
            name="signature"
            value={signature}
          />

<Card>
          <FormLayout>
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
            <TextField
              autoSize
              id="cardholder_name"
              label="Cardholder Name"
              onChange={e => {
                setCardholderName(e)
              }}
              value={cardHolderName}
            />
            <TextField
              autoSize
              id="card_number"
              label="Card Number"
              onChange={e => {
                setCardNumber(e)
              }}
              value={cardNumber}
            />
            <FormLayout.Group>
              <TextField
                autoSize
                id="card_security_code"
                label="Security Code"
                onChange={e => {
                  setCardSecurity(e)
                }}
                value={cardSecurity}
              />
              <TextField
                autoSize
                id="expiration_date"
                label="Expiration Date"
                onChange={e => {
                  setExpirationDate(e)
                }}
                value={expirationDate}
              />
            </FormLayout.Group>

            
            <InlineStack gap="200" align='end' >
            <Button size="large" variant="primary" submit fullWidth>
              Pay Now
            </Button>
           
            </InlineStack>
          </FormLayout>
      </Card>
        </Form>
    </Page>
  )
}

export default StandardMerchantPage
