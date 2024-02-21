import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.PUBLIC_URL}`
  : 'http://localhost:3000';

export const ContactEmail = ({ name = [], email = [], subject = [], message= [] }) => (
  <Html>
    <Head />
    <Preview>Someone filled out the contact form on Networking site.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Img
            src={`${baseUrl}/logo_networking.png`}
            width="49"
            height="21"
            alt="Networking"
          />
          <Hr style={hr} />
          <Text style={paragraph}>
            Congrats! Someone reached out via the contact form on your website.
          </Text>
          <Hr style={hr} />
          <Text style={paragraph}>
            <b>Name: </b> {name[0]}
          </Text>
          <Text style={paragraph}>
            <b>Email: </b> {email[0]}
          </Text>
          <Text style={paragraph}>
            <b>Subject: </b> {subject[0]}
          </Text>
          <Text style={paragraph}>
            <b>Message: </b><br />{message[0]}
          </Text>
          <Text style={paragraph}>— Site Admin</Text>
          <Hr style={hr} />
          <Text style={footer}>
            Networking Site, Newport Beach, CA 92660
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ContactEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const paragraph = {
  color: '#525f7f',

  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left',
};

const anchor = {
  color: '#556cd6',
};

const button = {
  backgroundColor: '#656ee8',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'block',
  width: '100%',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};