/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code for KPNP America</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Section style={header}>
          <Text style={logoText}>KPNP</Text>
          <Text style={logoSub}>America</Text>
        </Section>
        <Section style={redDivider}>&nbsp;</Section>
        <Section style={body}>
          <Text style={icon}>🔑</Text>
          <Heading style={h1}>Verification Code</Heading>
          <Text style={text}>Use the code below to confirm your identity:</Text>
          <Text style={codeStyle}>{token}</Text>
          <Section style={noticeBox}>
            <Text style={noticeText}>
              ⏱ This code will expire shortly. If you didn't request this, you can safely ignore this email.
            </Text>
          </Section>
        </Section>
        <Section style={footer}>
          <Text style={footerText}>
            KPNP America | <Link href="https://kpnpamerica.com" style={footerLink}>kpnpamerica.com</Link>
          </Text>
          <Text style={footerSub}>KPNP Co., Ltd. · Distributed by KPNP USA</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#f4f4f4', fontFamily: 'Arial, Helvetica, sans-serif', padding: '40px 16px' }
const wrapper = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' as const }
const header = { backgroundColor: '#111111', padding: '32px 40px 28px', textAlign: 'center' as const }
const logoText = { fontSize: '26px', fontWeight: '700' as const, color: '#ffffff', letterSpacing: '3px', textTransform: 'uppercase' as const, margin: '0', textAlign: 'center' as const }
const logoSub = { fontSize: '13px', color: '#CC0000', letterSpacing: '2px', textTransform: 'uppercase' as const, margin: '4px 0 0', textAlign: 'center' as const }
const redDivider = { backgroundColor: '#CC0000', height: '4px', fontSize: '0', lineHeight: '0', margin: '0' }
const body = { padding: '44px 48px 36px', textAlign: 'center' as const }
const icon = { fontSize: '28px', margin: '0 0 20px', textAlign: 'center' as const }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#111111', margin: '0 0 12px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#555555', lineHeight: '1.6', margin: '0 0 24px', textAlign: 'center' as const }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '32px', fontWeight: 'bold' as const, color: '#CC0000', margin: '0 0 30px', textAlign: 'center' as const, letterSpacing: '6px' }
const noticeBox = { backgroundColor: '#f9f9f9', borderLeft: '3px solid #CC0000', padding: '14px 18px', borderRadius: '0 4px 4px 0', textAlign: 'left' as const }
const noticeText = { margin: '0', fontSize: '13px', color: '#666666', lineHeight: '1.5' }
const footer = { backgroundColor: '#111111', padding: '24px 40px', textAlign: 'center' as const }
const footerText = { margin: '0 0 8px', fontSize: '12px', color: '#888888' }
const footerLink = { color: '#CC0000', textDecoration: 'none' }
const footerSub = { margin: '0', fontSize: '11px', color: '#555555' }
