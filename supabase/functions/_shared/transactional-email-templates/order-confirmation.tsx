import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Column, Container, Head, Heading, Hr, Html,
  Link, Preview, Row, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'KPNP America'

interface OrderItem {
  name: string
  sku?: string
  qty: number
  price: string
}

interface OrderConfirmationProps {
  userName?: string
  orderNumber?: string
  orderDate?: string
  items?: OrderItem[]
  subtotal?: string
  shippingMethod?: string
  shippingCost?: string
  taxRate?: string
  taxAmount?: string
  orderTotal?: string
  shippingName?: string
  shippingAddressLine1?: string
  shippingCity?: string
  shippingState?: string
  shippingZip?: string
  shippingCountry?: string
  paymentMethod?: string
  paymentLast4?: string
  orderUrl?: string
}

const OrderConfirmationEmail = ({
  userName = 'Customer',
  orderNumber = '—',
  orderDate = new Date().toLocaleDateString('en-US'),
  items = [],
  subtotal = '$0.00',
  shippingMethod = 'Standard',
  shippingCost = '$0.00',
  taxRate = '0%',
  taxAmount = '$0.00',
  orderTotal = '$0.00',
  shippingName = '',
  shippingAddressLine1 = '',
  shippingCity = '',
  shippingState = '',
  shippingZip = '',
  shippingCountry = 'US',
  paymentMethod = 'Card',
  paymentLast4 = '****',
  orderUrl,
}: OrderConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Order #{orderNumber} confirmed — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        {/* Header */}
        <Section style={header}>
          <Text style={logoText}>K P N P</Text>
          <Text style={logoSub}>A M E R I C A</Text>
        </Section>
        <Section style={redDivider}>&nbsp;</Section>

        {/* Body */}
        <Section style={bodySection}>
          <Heading style={h1}>Order confirmed!</Heading>
          <Text style={orderMeta}>Order #{orderNumber} · {orderDate}</Text>
          <Text style={greeting}>
            Hi, {userName}! Your order has been received and is being processed. Below is a summary of your purchase:
          </Text>

          {/* Items table header */}
          <Section style={tableHeader}>
            <Row>
              <Column style={thProduct}>PRODUCT</Column>
              <Column style={thQty}>QTY.</Column>
              <Column style={thPrice}>PRICE</Column>
            </Row>
          </Section>

          {/* Items */}
          {items.map((item, i) => (
            <Section key={i} style={i % 2 === 0 ? tableRowEven : tableRowOdd}>
              <Row>
                <Column style={tdProduct}>
                  <Text style={itemName}>{item.name}</Text>
                  {item.sku && <Text style={itemSku}>SKU: {item.sku}</Text>}
                </Column>
                <Column style={tdQty}>
                  <Text style={cellText}>{item.qty}</Text>
                </Column>
                <Column style={tdPrice}>
                  <Text style={cellText}>{item.price}</Text>
                </Column>
              </Row>
            </Section>
          ))}

          <Hr style={divider} />

          {/* Totals */}
          <Section style={totalsSection}>
            <Row>
              <Column style={totalLabel}>Subtotal:</Column>
              <Column style={totalValue}>{subtotal}</Column>
            </Row>
            <Row>
              <Column style={totalLabel}>Shipping ({shippingMethod}):</Column>
              <Column style={totalValue}>{shippingCost}</Column>
            </Row>
            <Row>
              <Column style={totalLabel}>Tax ({taxRate}):</Column>
              <Column style={totalValue}>{taxAmount}</Column>
            </Row>
          </Section>

          <Section style={grandTotalSection}>
            <Row>
              <Column style={grandTotalLabel}>TOTAL:</Column>
              <Column style={grandTotalValue}>{orderTotal}</Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Shipping address */}
          <Section style={infoBlock}>
            <Heading as="h2" style={h2}>SHIPPING ADDRESS</Heading>
            {shippingName && <Text style={infoText}>{shippingName}</Text>}
            {shippingAddressLine1 && <Text style={infoText}>{shippingAddressLine1}</Text>}
            {shippingCity && (
              <Text style={infoText}>
                {shippingCity}, {shippingState} {shippingZip}
              </Text>
            )}
            {shippingCountry && <Text style={infoText}>{shippingCountry}</Text>}
          </Section>

          {/* Payment */}
          <Section style={infoBlock}>
            <Heading as="h2" style={h2}>PAYMENT</Heading>
            <Text style={infoText}>{paymentMethod}</Text>
            <Text style={infoText}>{paymentLast4}</Text>
          </Section>

          <Hr style={divider} />

          {/* Tracking notice */}
          <Section style={noticeBox}>
            <Text style={noticeText}>
              📦 You will receive a follow-up email with your tracking number once your order has been shipped.
            </Text>
          </Section>

          {orderUrl && (
            <Section style={ctaWrap}>
              <Button style={button} href={orderUrl}>
                View my order →
              </Button>
            </Section>
          )}
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            {SITE_NAME} | <Link href="https://kpnpamerica.com" style={footerLink}>kpnpamerica.com</Link>
          </Text>
          <Text style={footerSub}>
            Questions about your order? <Link href="mailto:info@kpnpamerica.com" style={footerLink}>info@kpnpamerica.com</Link>
          </Text>
          <Text style={footerCopy}>KPNP Co., Ltd. · Distributed by KPNP USA</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderConfirmationEmail,
  subject: (data: Record<string, any>) =>
    `Order #${data?.orderNumber || ''} confirmed — KPNP America`,
  displayName: 'Order confirmation',
  previewData: {
    userName: 'Jane Doe',
    orderNumber: '10042',
    orderDate: 'Mar 26, 2026',
    items: [
      { name: 'KPNP E-Foot Protector', sku: 'KP-EFP-M', qty: 1, price: '$189.00' },
      { name: 'KPNP E-Head Guard', sku: 'KP-EHG-L', qty: 1, price: '$249.00' },
    ],
    subtotal: '$438.00',
    shippingMethod: 'Standard',
    shippingCost: '$12.00',
    taxRate: '8.25%',
    taxAmount: '$36.14',
    orderTotal: '$486.14',
    shippingName: 'Jane Doe',
    shippingAddressLine1: '123 Main St',
    shippingCity: 'Houston',
    shippingState: 'TX',
    shippingZip: '77001',
    shippingCountry: 'United States',
    paymentMethod: 'Visa',
    paymentLast4: '•••• 4242',
    orderUrl: 'https://kpnpamerica.com/account',
  },
} satisfies TemplateEntry

// Styles — KPNP branding: #111111 dark, #CC0000 red accent, white body
const main = { backgroundColor: '#f4f4f4', fontFamily: 'Arial, Helvetica, sans-serif', padding: '40px 16px' }
const wrapper = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' as const }
const header = { backgroundColor: '#111111', padding: '32px 40px 28px', textAlign: 'center' as const }
const logoText = { fontSize: '26px', fontWeight: '700' as const, color: '#ffffff', letterSpacing: '6px', textTransform: 'uppercase' as const, margin: '0', textAlign: 'center' as const }
const logoSub = { fontSize: '13px', color: '#CC0000', letterSpacing: '4px', textTransform: 'uppercase' as const, margin: '4px 0 0', textAlign: 'center' as const }
const redDivider = { backgroundColor: '#CC0000', height: '4px', fontSize: '0', lineHeight: '0', margin: '0' }
const bodySection = { padding: '40px 48px 36px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#111111', margin: '0 0 8px', textAlign: 'center' as const }
const orderMeta = { fontSize: '14px', color: '#888888', margin: '0 0 20px', textAlign: 'center' as const }
const greeting = { fontSize: '15px', color: '#555555', lineHeight: '1.6', margin: '0 0 28px' }
const tableHeader = { backgroundColor: '#111111', padding: '10px 16px', borderRadius: '4px 4px 0 0' }
const thProduct = { color: '#ffffff', fontSize: '11px', fontWeight: '700' as const, letterSpacing: '1px', width: '55%' }
const thQty = { color: '#ffffff', fontSize: '11px', fontWeight: '700' as const, letterSpacing: '1px', width: '20%', textAlign: 'center' as const }
const thPrice = { color: '#ffffff', fontSize: '11px', fontWeight: '700' as const, letterSpacing: '1px', width: '25%', textAlign: 'right' as const }
const tableRowEven = { padding: '12px 16px', backgroundColor: '#f9f9f9' }
const tableRowOdd = { padding: '12px 16px', backgroundColor: '#ffffff' }
const tdProduct = { width: '55%', verticalAlign: 'top' as const }
const tdQty = { width: '20%', textAlign: 'center' as const, verticalAlign: 'top' as const }
const tdPrice = { width: '25%', textAlign: 'right' as const, verticalAlign: 'top' as const }
const itemName = { fontSize: '14px', fontWeight: '600' as const, color: '#111111', margin: '0 0 2px' }
const itemSku = { fontSize: '12px', color: '#999999', margin: '0' }
const cellText = { fontSize: '14px', color: '#333333', margin: '0' }
const divider = { borderColor: '#eeeeee', margin: '24px 0' }
const totalsSection = { padding: '0 0 8px' }
const totalLabel = { fontSize: '14px', color: '#555555', width: '70%', padding: '4px 0' }
const totalValue = { fontSize: '14px', color: '#333333', width: '30%', textAlign: 'right' as const, padding: '4px 0' }
const grandTotalSection = { backgroundColor: '#f9f9f9', padding: '12px 16px', borderRadius: '4px', marginBottom: '8px' }
const grandTotalLabel = { fontSize: '16px', fontWeight: '700' as const, color: '#111111', width: '70%' }
const grandTotalValue = { fontSize: '16px', fontWeight: '700' as const, color: '#CC0000', width: '30%', textAlign: 'right' as const }
const infoBlock = { marginBottom: '20px' }
const h2 = { fontSize: '13px', fontWeight: '700' as const, color: '#111111', letterSpacing: '1px', margin: '0 0 8px' }
const infoText = { fontSize: '14px', color: '#555555', margin: '0 0 4px', lineHeight: '1.5' }
const noticeBox = { backgroundColor: '#f9f9f9', borderLeft: '3px solid #CC0000', padding: '14px 18px', borderRadius: '0 4px 4px 0', marginBottom: '24px' }
const noticeText = { margin: '0', fontSize: '13px', color: '#666666', lineHeight: '1.5' }
const ctaWrap = { textAlign: 'center' as const, padding: '0 0 8px' }
const button = { backgroundColor: '#CC0000', color: '#ffffff', fontSize: '15px', fontWeight: '700' as const, borderRadius: '5px', padding: '14px 36px', textDecoration: 'none' }
const footer = { backgroundColor: '#111111', padding: '24px 40px', textAlign: 'center' as const }
const footerText = { margin: '0 0 8px', fontSize: '12px', color: '#888888' }
const footerLink = { color: '#CC0000', textDecoration: 'none' }
const footerSub = { margin: '0 0 8px', fontSize: '11px', color: '#555555' }
const footerCopy = { margin: '0', fontSize: '11px', color: '#444444' }
