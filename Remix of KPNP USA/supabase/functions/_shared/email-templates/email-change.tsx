/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change for KPNP America</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Section style={header}>
          <Text style={logoText}>KPNP</Text>
          <Text style={logoSub}>America</Text>
        </Section>
        <Section style={redDivider}>&nbsp;</Section>
        <Section style={body}>
          <Text style={icon}>📧</Text>
          <Heading style={h1}>Confirm your email change</Heading>
          <Text style={text}>
            You requested to change your email address from {email} to {newEmail}. Click the button below to confirm:
          </Text>
          <Section style={ctaWrap}>
            <Button style={button} href={confirmationUrl}>
              Confirm Email Change
            </Button>
          </Section>
          <Section style={noticeBox}>
            <Text style={noticeText}>
              🔒 If you didn't request this change, please secure your account immediately.
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

export default EmailChangeEmail

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
const ctaWrap = { textAlign: 'center' as const, padding: '8px 0 28px' }
const button = { backgroundColor: '#CC0000', color: '#ffffff', fontSize: '15px', fontWeight: '700' as const, borderRadius: '5px', padding: '14px 36px', textDecoration: 'none' }
const noticeBox = { backgroundColor: '#f9f9f9', borderLeft: '3px solid #CC0000', padding: '14px 18px', borderRadius: '0 4px 4px 0', textAlign: 'left' as const }
const noticeText = { margin: '0', fontSize: '13px', color: '#666666', lineHeight: '1.5' }
const footer = { backgroundColor: '#111111', padding: '24px 40px', textAlign: 'center' as const }
const footerText = { margin: '0 0 8px', fontSize: '12px', color: '#888888' }
const footerLink = { color: '#CC0000', textDecoration: 'none' }
const footerSub = { margin: '0', fontSize: '11px', color: '#555555' }
