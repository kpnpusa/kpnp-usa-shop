// Product variant definitions — verified from kpnpamerica.com

export type VariantOption = {
  label: string;
  value: string;
};

export type ProductVariants = {
  sizes?: VariantOption[];
  colors?: VariantOption[];
};

// ─── Size sets based on kpnpamerica.com product pages ───

// Electronic Socks K1: #1 US4 → #10 US13 (verified from kpnpamerica.com)
const ESOCK_SIZES: VariantOption[] = [
  { label: "#1 - US 4", value: "#1-US4" },
  { label: "#2 - US 5", value: "#2-US5" },
  { label: "#3 - US 6", value: "#3-US6" },
  { label: "#4 - US 7", value: "#4-US7" },
  { label: "#5 - US 8", value: "#5-US8" },
  { label: "#6 - US 9", value: "#6-US9" },
  { label: "#7 - US 10", value: "#7-US10" },
  { label: "#8 - US 11", value: "#8-US11" },
  { label: "#9 - US 12", value: "#9-US12" },
  { label: "#10 - US 13", value: "#10-US13" },
];

// Electronic Head Protector: XS–XL + Blue/Red (verified from kpnpamerica.com)
const EHP_SIZES: VariantOption[] = [
  { label: "XS", value: "XS" },
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
];
const EHP_COLORS: VariantOption[] = [
  { label: "Blue", value: "Blue" },
  { label: "Red", value: "Red" },
];

// Electronic Chest Protector: 1–5 (standard KPNP numbering)
const CHEST_PROTECTOR_SIZES: VariantOption[] = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
];

// Doboks / Uniforms: US-110 → US-210 (verified from kpnpamerica.com Victor Dobok, Jacquard Dobok)
const DOBOK_SIZES: VariantOption[] = [
  { label: "110", value: "US-110" },
  { label: "120", value: "US-120" },
  { label: "130", value: "US-130" },
  { label: "140", value: "US-140" },
  { label: "150", value: "US-150" },
  { label: "160", value: "US-160" },
  { label: "170", value: "US-170" },
  { label: "180", value: "US-180" },
  { label: "190", value: "US-190" },
  { label: "200", value: "US-200" },
  { label: "210", value: "US-210" },
];

// Poomsae Master Dobok: US-130 → US-210 (verified from kpnpamerica.com)
const POOMSAE_MASTER_SIZES: VariantOption[] = [
  { label: "130", value: "US-130" },
  { label: "140", value: "US-140" },
  { label: "150", value: "US-150" },
  { label: "160", value: "US-160" },
  { label: "170", value: "US-170" },
  { label: "180", value: "US-180" },
  { label: "190", value: "US-190" },
  { label: "200", value: "US-200" },
  { label: "210", value: "US-210" },
];

// Poomsae Dan/Poom Doboks: US-150 → US-210 (verified from kpnpamerica.com Dan Female page)
const POOMSAE_DAN_SIZES: VariantOption[] = [
  { label: "150", value: "US-150" },
  { label: "160", value: "US-160" },
  { label: "170", value: "US-170" },
  { label: "180", value: "US-180" },
  { label: "190", value: "US-190" },
  { label: "200", value: "US-200" },
  { label: "210", value: "US-210" },
];

// Black/Blue Label Uniforms: 140–190 (verified from kpnpamerica.com — sizes shown on product pages)
const LABEL_UNIFORM_SIZES: VariantOption[] = [
  { label: "140", value: "US-140" },
  { label: "150", value: "US-150" },
  { label: "160", value: "US-160" },
  { label: "170", value: "US-170" },
  { label: "180", value: "US-180" },
  { label: "190", value: "US-190" },
];

// Apparel (Neongreen Jacket): XS–3XL (verified from kpnpamerica.com)
const APPAREL_SIZES: VariantOption[] = [
  { label: "XS", value: "XS" },
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
  { label: "2XL", value: "2XL" },
  { label: "3XL", value: "3XL" },
];

// Arm Guard: XS–XL (verified from kpnpamerica.com)
const ARM_GUARD_SIZES: VariantOption[] = [
  { label: "XS", value: "XS" },
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
];

// Groin Guard F/M, Shin Guards, BL Shin Guard: S–XL (verified from kpnpamerica.com)
const GUARD_S_XL: VariantOption[] = [
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
];

// Hogu (Reversible): 1–5 (standard KPNP hogu sizing)
const HOGU_SIZES: VariantOption[] = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
];

// Taekwondo Shoes: US sizes
const SHOE_SIZES: VariantOption[] = [
  { label: "5", value: "5" },
  { label: "5.5", value: "5.5" },
  { label: "6", value: "6" },
  { label: "6.5", value: "6.5" },
  { label: "7", value: "7" },
  { label: "7.5", value: "7.5" },
  { label: "8", value: "8" },
  { label: "8.5", value: "8.5" },
  { label: "9", value: "9" },
  { label: "9.5", value: "9.5" },
  { label: "10", value: "10" },
  { label: "10.5", value: "10.5" },
  { label: "11", value: "11" },
  { label: "12", value: "12" },
  { label: "13", value: "13" },
];

// Belt sizes
const BELT_SIZES: VariantOption[] = [
  { label: "180cm", value: "180" },
  { label: "200cm", value: "200" },
  { label: "220cm", value: "220" },
  { label: "240cm", value: "240" },
  { label: "260cm", value: "260" },
  { label: "280cm", value: "280" },
  { label: "300cm", value: "300" },
  { label: "320cm", value: "320" },
];

// ─── Product → Variants map (static + DB IDs) ───

export const productVariants: Record<string, ProductVariants> = {
  // ══════ K1 PSS ══════

  // Electronic Socks K1 — sizes #1 US4 → #10 US13
  "electronic-socks-k1": { sizes: ESOCK_SIZES },
  "kpnp-electronic-socks-k1": { sizes: ESOCK_SIZES },

  // Electronic Chest Protector — sizes 1–5
  "chest-protector-new": { sizes: CHEST_PROTECTOR_SIZES, colors: EHP_COLORS },
  "kpnp-dual-band-electronic-chest-protector-new": { sizes: CHEST_PROTECTOR_SIZES, colors: EHP_COLORS },
  "chest-protector-preowned": { sizes: CHEST_PROTECTOR_SIZES, colors: EHP_COLORS },

  // Electronic Head Protector — sizes XS–XL, colors Blue/Red
  "head-protector-new": { sizes: EHP_SIZES, colors: EHP_COLORS },
  "kpnp-dual-band-electronic-head-protector-new": { sizes: EHP_SIZES, colors: EHP_COLORS },
  "head-protector-preowned": { sizes: EHP_SIZES, colors: EHP_COLORS },

  // Judge Scoring System — NO VARIANTS (electronic unit)
  // Dual Band Receiver — NO VARIANTS (electronic unit)

  // ══════ K2 PSS ══════

  // K2 Electronic Socks — same sizing as K1
  "k2-electronic-socks": { sizes: ESOCK_SIZES },
  "kpnp-k2-electronic-socks": { sizes: ESOCK_SIZES },

  // K2 Chest Protector — sizes 1–5
  "k2-chest-protector": { sizes: CHEST_PROTECTOR_SIZES },
  "kpnp-pss-k2-taekwondo-dual-band-electronic-chest-protector": { sizes: CHEST_PROTECTOR_SIZES },

  // K2 EHP — sizes XS–XL, colors Blue/Red
  "k2-ehp": { sizes: EHP_SIZES, colors: EHP_COLORS },
  "kpnp-pss-k2-ehp": { sizes: EHP_SIZES, colors: EHP_COLORS },

  // ══════ Apparel ══════

  // Gold Label Tracksuit — XS–3XL
  "gold-label-tracksuit": { sizes: APPAREL_SIZES },
  "kpnp-gold-label-tracksuit-unisex": { sizes: APPAREL_SIZES },

  // Tracksuit Grey — XS–3XL
  "tracksuit-grey": { sizes: APPAREL_SIZES },
  "kpnp-tracksuit-set-grey": { sizes: APPAREL_SIZES },

  // Polo Shirt Black — XS–3XL
  "polo-shirt-black": { sizes: APPAREL_SIZES },
  "kpnp-polo-shirt-black": { sizes: APPAREL_SIZES },

  // Dri-Fit Shirt Black — XS–3XL
  "drifit-shirt-black": { sizes: APPAREL_SIZES },
  "kpnp-dri-fit-shirt-black": { sizes: APPAREL_SIZES },

  // Dri-Fit Shirt White — XS–3XL
  "drifit-shirt-white": { sizes: APPAREL_SIZES },
  "kpnp-dri-fit-shirt-white": { sizes: APPAREL_SIZES },

  // Neon Green Shorts — XS–3XL
  "neon-green-shorts": { sizes: APPAREL_SIZES },
  "kpnp-neon-green-shorts": { sizes: APPAREL_SIZES },

  // Neongreen Jacket — XS–3XL (verified)
  "neongreen-jacket": { sizes: APPAREL_SIZES },
  "kpnp-neongreen-black-jacket-f-m": { sizes: APPAREL_SIZES },

  // ══════ Uniforms ══════

  // Black Label Uniform — 140–190 (verified from kpnpamerica.com)
  "black-label-uniform": { sizes: LABEL_UNIFORM_SIZES },
  "kpnp-elite-black-label-uniform": { sizes: LABEL_UNIFORM_SIZES },

  // Blue Label Uniform — 140–190 (verified from kpnpamerica.com)
  "blue-label-uniform": { sizes: LABEL_UNIFORM_SIZES },
  "kpnp-elite-blue-label-uniform": { sizes: LABEL_UNIFORM_SIZES },

  // Official Black Belt — belt lengths
  "official-black-belt": { sizes: BELT_SIZES },
  "kpnp-official-black-belt": { sizes: BELT_SIZES },

  // Victor Dobok — 110–210 (verified)
  "victor-dobok": { sizes: DOBOK_SIZES },
  "kpnp-victor-dobok-100-polyester": { sizes: DOBOK_SIZES },

  // Authentic Uniform — 110–210
  "authentic-uniform": { sizes: DOBOK_SIZES },
  "kpnp-authentic-uniform": { sizes: DOBOK_SIZES },

  // Ribbed Dobok — 110–210
  "ribbed-dobok": { sizes: DOBOK_SIZES },
  "kpnp-ribbed-dobok": { sizes: DOBOK_SIZES },

  // Jacquard Dobok — 110–210 (verified)
  "jacquard-dobok": { sizes: DOBOK_SIZES },
  "kpnp-jacquard-dobok": { sizes: DOBOK_SIZES },

  // Poomsae Master Dobok — 130–210 (verified)
  "poomsae-master-dobok": { sizes: POOMSAE_MASTER_SIZES },
  "kpnp-poomsae-master-dobok": { sizes: POOMSAE_MASTER_SIZES },

  // Poomsae Dan Male — 150–210
  "poomsae-dan-male": { sizes: POOMSAE_DAN_SIZES },
  "kpnp-poomsae-dan-male-dobok": { sizes: POOMSAE_DAN_SIZES },

  // Poomsae Dan Female — 150–210 (verified)
  "poomsae-dan-female": { sizes: POOMSAE_DAN_SIZES },
  "kpnp-poomsae-dan-female-dobok": { sizes: POOMSAE_DAN_SIZES },

  // Poomsae Poom Male — 150–210
  "poomsae-poom-male": { sizes: POOMSAE_DAN_SIZES },
  "kpnp-poomsae-poom-male-dobok": { sizes: POOMSAE_DAN_SIZES },

  // Poomsae Poom Female — 150–210
  "poomsae-poom-female": { sizes: POOMSAE_DAN_SIZES },
  "kpnp-poomsae-poom-female-dobok": { sizes: POOMSAE_DAN_SIZES },

  // ══════ Training Equipment ══════

  // Taekwondo Shoes — US sizes
  "taekwondo-shoes": { sizes: SHOE_SIZES },
  "kpnp-performance-taekwondo-shoes": { sizes: SHOE_SIZES },

  // Double Target Mitt — NO VARIANTS (one size on kpnpamerica.com)

  // Kick Pads — NO VARIANTS (one size on kpnpamerica.com)

  // Hogu Reversible — 1–5
  "hogu-reversible": { sizes: HOGU_SIZES },
  "kpnp-hogu-reversible": { sizes: HOGU_SIZES },

  // Shin Guards — S–XL
  "shin-guards": { sizes: GUARD_S_XL },
  "kpnp-shin-guards": { sizes: GUARD_S_XL },

  // Arm Guard — XS–XL (verified)
  "arm-guard": { sizes: ARM_GUARD_SIZES },
  "kpnp-arm-guard": { sizes: ARM_GUARD_SIZES },

  // Groin Guard Female — S–XL (verified)
  "groin-guard-f": { sizes: GUARD_S_XL },
  "kpnp-groin-guard-f": { sizes: GUARD_S_XL },

  // Groin Guard Male — S–XL (verified)
  "groin-guard-m": { sizes: GUARD_S_XL },
  "kpnp-groin-guard-m": { sizes: GUARD_S_XL },

  // Black Label Shin Guard — S–XL (verified)
  "bl-shin-guard": { sizes: GUARD_S_XL },
  "kpnp-black-label-shin-guard": { sizes: GUARD_S_XL },

  // Black Label Arm Guard — S–XL
  "bl-arm-guard": { sizes: GUARD_S_XL },
  "kpnp-black-label-arm-guard": { sizes: GUARD_S_XL },

  // Black Label Groin Guard Female — S–XL
  "bl-groin-guard-female": { sizes: GUARD_S_XL },
  "kpnp-black-label-groin-guard-for-female": { sizes: GUARD_S_XL },

  // Black Label Groin Guard Male — S–XL
  "bl-groin-guard-male": { sizes: GUARD_S_XL },
  "kpnp-black-label-groin-guard-for-male": { sizes: GUARD_S_XL },
};

// ─── Disabled (out-of-stock) variants per product ───
// Based on analysis of kpnpamerica.com product pages.
// Keys are product IDs, values list size/color values that are unavailable.

export type DisabledVariants = {
  sizes?: string[];
  colors?: string[];
};

export const disabledVariants: Record<string, DisabledVariants> = {
  // Only truly out-of-stock items remain here

  // K2 PSS — coming soon items only (NOT preorder items which are purchasable)
  "k2-chest-protector": { sizes: ["1", "2", "3", "4", "5"] },
  "kpnp-pss-k2-taekwondo-dual-band-electronic-chest-protector": { sizes: ["1", "2", "3", "4", "5"] },
  "k2-ehp": { sizes: ["XS", "S", "M", "L", "XL"], colors: ["Blue", "Red"] },
  "kpnp-pss-k2-ehp": { sizes: ["XS", "S", "M", "L", "XL"], colors: ["Blue", "Red"] },
};
