// === Existing images ===
import taekwondoShoes from "@/assets/products/taekwondo-shoes.png";
import k2Socks from "@/assets/products/k2-socks.png";
import judgeScoringPreowned from "@/assets/products/judge-scoring-preowned.png";
import dualBandReceiverPreowned from "@/assets/products/dual-band-receiver-preowned.png";
import headProtectorPreowned from "@/assets/products/head-protector-preowned.png";
import chestProtectorPreowned from "@/assets/products/chest-protector-preowned.png";
import doubleTargetMitt from "@/assets/products/double-target-mitt.png";
import blackLabelUniform from "@/assets/products/black-label-uniform.png";
import blueLabelUniform from "@/assets/products/blue-label-uniform.png";
import goldLabelTracksuit from "@/assets/products/gold-label-tracksuit.png";
import judgeScoringNew from "@/assets/products/judge-scoring-new.png";
import headProtectorNew from "@/assets/products/head-protector-new.png";
import electronicSocksK1 from "@/assets/products/electronic-socks-k1.png";
import dualBandReceiverNew from "@/assets/products/dual-band-receiver-new.jpg";
import chestProtectorNew from "@/assets/products/chest-protector-new.png";

// === New images from KPNPAmerica.com ===
import k2ReceiverR20 from "@/assets/products/k2-receiver-r20.png";
import k2EsocksTester from "@/assets/products/k2-esocks-tester.png";
import k2ChestProtector from "@/assets/products/k2-chest-protector.png";
import k2Ehp from "@/assets/products/k2-ehp.png";
import k2ElectronicSocks from "@/assets/products/k2-electronic-socks.png";
import tracksuitGrey from "@/assets/products/tracksuit-grey.png";
import poloShirtBlack from "@/assets/products/polo-shirt-black.png";
import drifitShirtBlack from "@/assets/products/drifit-shirt-black.png";
import drifitShirtWhite from "@/assets/products/drifit-shirt-white.png";
import neongreenJacket from "@/assets/products/neongreen-jacket.png";
import neonGreenShorts from "@/assets/products/neon-green-shorts.png";
import poomsaeDanMale from "@/assets/products/poomsae-dan-male.png";
import poomsaeDanFemale from "@/assets/products/poomsae-dan-female.png";
import poomsaePoomMale from "@/assets/products/poomsae-poom-male.png";
import poomsaePoomFemale from "@/assets/products/poomsae-poom-female.png";
import officialBlackBelt from "@/assets/products/official-black-belt.png";
import victorDobok from "@/assets/products/victor-dobok.png";
import authenticUniform from "@/assets/products/authentic-uniform.png";
import ribbedDobok from "@/assets/products/ribbed-dobok.png";
import jacquardDobok from "@/assets/products/jacquard-dobok.png";
import poomsaeMasterDobok from "@/assets/products/poomsae-master-dobok.png";
import blShinGuard from "@/assets/products/bl-shin-guard.png";
import blArmGuard from "@/assets/products/bl-arm-guard.png";
import blGroinGuardFemale from "@/assets/products/bl-groin-guard-female.png";
import blGroinGuardMale from "@/assets/products/bl-groin-guard-male.png";
import kickPads from "@/assets/products/kick-pads.png";
import hoguReversible from "@/assets/products/hogu-reversible.png";
import shinGuards from "@/assets/products/shin-guards.png";
import armGuard from "@/assets/products/arm-guard.png";
import groinGuardF from "@/assets/products/groin-guard-f.png";
import groinGuardM from "@/assets/products/groin-guard-m.png";

export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: "k1-pss" | "k2-pss" | "apparel" | "uniforms" | "training";
  badge?: "sale" | "bestseller" | "preorder" | "coming-soon" | "premium" | "sold-out";
  badgeText?: string;
  stockStatus?: "in_stock" | "out_of_stock";
  availableVariants?: { sizes?: string[]; colors?: string[] };
};

export const products: Product[] = [
  // ──────────── K1 PSS System ────────────
  {
    id: "electronic-socks-k1",
    name: "KPNP Electronic Socks (K1)",
    price: 119,
    image: electronicSocksK1,
    category: "k1-pss",
    badge: "bestseller",
    badgeText: "Best Seller!",
  },
  {
    id: "judge-scoring-new",
    name: "KPNP Electronic Judge Scoring System (New)",
    price: 712,
    originalPrice: 890,
    image: judgeScoringNew,
    category: "k1-pss",
    badge: "sale",
    badgeText: "20% Off",
  },
  {
    id: "head-protector-new",
    name: "KPNP Dual Band Electronic Head Protector (New)",
    price: 760,
    originalPrice: 950,
    image: headProtectorNew,
    category: "k1-pss",
    badge: "sale",
    badgeText: "20% Off",
  },
  {
    id: "chest-protector-new",
    name: "KPNP Dual Band Electronic Chest Protector (New)",
    price: 760,
    originalPrice: 950,
    image: chestProtectorNew,
    category: "k1-pss",
    badge: "sale",
    badgeText: "20% Off",
  },
  {
    id: "dual-band-receiver-new",
    name: "KPNP Dual Band Receiver (New)",
    price: 712,
    originalPrice: 890,
    image: dualBandReceiverNew,
    category: "k1-pss",
    badge: "sale",
    badgeText: "20% Off",
  },
  {
    id: "chest-protector-preowned",
    name: "KPNP Dual Band Electronic Chest Protector (Pre-Owned)",
    price: 570,
    originalPrice: 950,
    image: chestProtectorPreowned,
    category: "k1-pss",
    badge: "sale",
    badgeText: "Pre-Owned",
  },
  {
    id: "head-protector-preowned",
    name: "KPNP Dual Band Electronic Head Protector (Pre-Owned)",
    price: 570,
    originalPrice: 950,
    image: headProtectorPreowned,
    category: "k1-pss",
    badge: "sale",
    badgeText: "Pre-Owned",
  },
  {
    id: "dual-band-receiver-preowned",
    name: "KPNP Dual Band Receiver (Pre-Owned)",
    price: 534,
    originalPrice: 870,
    image: dualBandReceiverPreowned,
    category: "k1-pss",
    badge: "sale",
    badgeText: "Pre-Owned",
  },
  {
    id: "judge-scoring-preowned",
    name: "KPNP Electronic Judge Scoring System (Pre-Owned)",
    price: 534,
    originalPrice: 890,
    image: judgeScoringPreowned,
    category: "k1-pss",
    badge: "sale",
    badgeText: "Pre-Owned",
  },

  // ──────────── K2 PSS System ────────────
  {
    id: "k2-electronic-socks",
    name: "KPNP K2 Electronic Socks",
    price: 129,
    image: k2ElectronicSocks,
    category: "k2-pss",
    badge: "preorder",
    badgeText: "Preorder: Ships March 15",
  },
  {
    id: "k2-receiver-r20",
    name: "K2 Receiver R-20",
    price: 0,
    image: k2ReceiverR20,
    category: "k2-pss",
    badge: "sold-out",
    badgeText: "Sold Out",
  },
  {
    id: "k2-esocks-tester",
    name: "K2 E-Socks Tester",
    price: 0,
    image: k2EsocksTester,
    category: "k2-pss",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "k2-chest-protector",
    name: "KPNP PSS K2 Dual Band Electronic Chest Protector",
    price: 0,
    image: k2ChestProtector,
    category: "k2-pss",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "k2-ehp",
    name: "KPNP PSS K2 EHP",
    price: 0,
    image: k2Ehp,
    category: "k2-pss",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },

  // ──────────── KPNP Apparel ────────────
  {
    id: "gold-label-tracksuit",
    name: "KPNP Gold Label Tracksuit (Unisex)",
    price: 109,
    image: goldLabelTracksuit,
    category: "apparel",
  },
  {
    id: "tracksuit-grey",
    name: "KPNP Tracksuit Set (Grey)",
    price: 0,
    image: tracksuitGrey,
    category: "apparel",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "polo-shirt-black",
    name: "KPNP Polo Shirt (Black)",
    price: 0,
    image: poloShirtBlack,
    category: "apparel",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "drifit-shirt-black",
    name: "KPNP Dri-Fit Shirt (Black)",
    price: 0,
    image: drifitShirtBlack,
    category: "apparel",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "drifit-shirt-white",
    name: "KPNP Dri-Fit Shirt (White)",
    price: 0,
    image: drifitShirtWhite,
    category: "apparel",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "neon-green-shorts",
    name: "KPNP Neon Green Shorts",
    price: 0,
    image: neonGreenShorts,
    category: "apparel",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "neongreen-jacket",
    name: "KPNP Neongreen Black Jacket F/M",
    price: 0,
    image: neongreenJacket,
    category: "apparel",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },

  // ──────────── KPNP Uniforms ────────────
  {
    id: "black-label-uniform",
    name: "KPNP Elite Black Label Uniform",
    price: 295,
    image: blackLabelUniform,
    category: "uniforms",
  },
  {
    id: "blue-label-uniform",
    name: "KPNP Elite Blue Label Uniform",
    price: 190,
    image: blueLabelUniform,
    category: "uniforms",
  },
  {
    id: "official-black-belt",
    name: "KPNP Official Black Belt",
    price: 0,
    image: officialBlackBelt,
    category: "uniforms",
    badge: "premium",
    badgeText: "Premium",
  },
  {
    id: "victor-dobok",
    name: "KPNP Victor Dobok – 100% Polyester",
    price: 0,
    image: victorDobok,
    category: "uniforms",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "authentic-uniform",
    name: "KPNP Authentic Uniform",
    price: 0,
    image: authenticUniform,
    category: "uniforms",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "ribbed-dobok",
    name: "KPNP Ribbed Dobok",
    price: 0,
    image: ribbedDobok,
    category: "uniforms",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "jacquard-dobok",
    name: "KPNP Jacquard Dobok",
    price: 0,
    image: jacquardDobok,
    category: "uniforms",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "poomsae-master-dobok",
    name: "KPNP Poomsae Master Dobok",
    price: 0,
    image: poomsaeMasterDobok,
    category: "uniforms",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "poomsae-dan-male",
    name: "KPNP Poomsae Dan Male Dobok",
    price: 0,
    image: poomsaeDanMale,
    category: "uniforms",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "poomsae-dan-female",
    name: "KPNP Poomsae Dan Female Dobok",
    price: 0,
    image: poomsaeDanFemale,
    category: "uniforms",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "poomsae-poom-male",
    name: "KPNP Poomsae Poom Male Dobok",
    price: 0,
    image: poomsaePoomMale,
    category: "uniforms",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "poomsae-poom-female",
    name: "KPNP Poomsae Poom Female Dobok",
    price: 0,
    image: poomsaePoomFemale,
    category: "uniforms",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },

  // ──────────── Training Equipment ────────────
  {
    id: "taekwondo-shoes",
    name: "KPNP Performance Taekwondo Shoes",
    price: 79,
    image: taekwondoShoes,
    category: "training",
  },
  {
    id: "double-target-mitt",
    name: "KPNP Double Target Mitt",
    price: 45,
    image: doubleTargetMitt,
    category: "training",
  },
  {
    id: "kick-pads",
    name: "KPNP Martial Arts Kick Pads",
    price: 0,
    image: kickPads,
    category: "training",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "hogu-reversible",
    name: "KPNP Hogu (Reversible)",
    price: 0,
    image: hoguReversible,
    category: "training",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "shin-guards",
    name: "KPNP Shin Guards",
    price: 0,
    image: shinGuards,
    category: "training",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "arm-guard",
    name: "KPNP Arm Guard",
    price: 0,
    image: armGuard,
    category: "training",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "groin-guard-f",
    name: "KPNP Groin Guard (F)",
    price: 0,
    image: groinGuardF,
    category: "training",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "groin-guard-m",
    name: "KPNP Groin Guard (M)",
    price: 0,
    image: groinGuardM,
    category: "training",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "bl-shin-guard",
    name: "KPNP Black Label Shin Guard",
    price: 0,
    image: blShinGuard,
    category: "training",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "bl-arm-guard",
    name: "KPNP Black Label Arm Guard",
    price: 0,
    image: blArmGuard,
    category: "training",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "bl-groin-guard-female",
    name: "KPNP Black Label Groin Guard (Female)",
    price: 0,
    image: blGroinGuardFemale,
    category: "training",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
  {
    id: "bl-groin-guard-male",
    name: "KPNP Black Label Groin Guard (Male)",
    price: 0,
    image: blGroinGuardMale,
    category: "training",
    badge: "coming-soon",
    badgeText: "Coming Soon",
  },
];
