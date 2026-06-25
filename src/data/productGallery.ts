/**
 * Gallery images and descriptions for all products, sourced from kpnpamerica.com.
 * Keys match product IDs from products.ts.
 */

const CDN = "https://cdn.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=scale-down/cdn-ecommerce/store_01K5QJV0TPFZFZG921GYFPHAQJ/assets";

export type ProductGalleryData = {
  images: string[];
  description?: string;
};

export const productGallery: Record<string, ProductGalleryData> = {
  // ═══════════ K1 PSS ═══════════
  "electronic-socks-k1": {
    images: [
      `${CDN}/f288415d-1096-4b49-be7c-bed927cf4e19.png`,
      `${CDN}/e77b912b-3230-4d0b-aaf2-d929a4401f7c.png`,
      `${CDN}/79b13146-d8f1-4577-9bb9-533d0e388943.png`,
    ],
    description:
      "Experience next-level performance with the KPNP Electronic Taekwondo Foot Protector. Engineered for seamless integration with electronic scoring systems, ensuring precise and reliable point detection during every match. Ergonomic, lightweight construction provides superior comfort and freedom of movement.",
  },
  "chest-protector-new": {
    images: [
      `${CDN}/89bfd325-1cbd-4757-947e-1cabf4fd8afb.png`,
    ],
    description:
      "Dual Band K1 PSS with latest firmware update for quick and stable connection. The reversible design features vibrant red and blue sides. Lightweight and ergonomic, it ensures unrestricted movement while delivering maximum defense. Available in multiple sizes.",
  },
  "head-protector-new": {
    images: [
      `${CDN}/96b7e537-4bab-4911-ba2b-b0a7835d78ba.png`,
    ],
    description:
      "KPNP Dual Band Electronic Head Protector with advanced sensor technology for precise head-kick scoring. Designed for maximum protection and comfort during competition.",
  },
  "dual-band-receiver-new": {
    images: [
      `${CDN}/cea50923-d1a6-4714-9895-9f726ca224b7.jpg`,
    ],
    description:
      "The KPNP receiver uses the IEEE 802.15.4 standard with 2.4GHz frequency band in dual PHY form for fast data transmission speed. Minimizes power consumption for long-life usage.",
  },
  "judge-scoring-new": {
    images: [
      `${CDN}/d1c0ea4c-05d0-4019-9f2c-b7039c15a67c.png`,
    ],
    description:
      "Professional-grade electronic scoring for Taekwondo tournaments. Latest firmware ensures accurate and real-time score registration.",
  },
  "chest-protector-preowned": {
    images: [
      `${CDN}/89bfd325-1cbd-4757-947e-1cabf4fd8afb.png`,
    ],
    description:
      "Pre-owned Dual Band Electronic Chest Protector. Fully tested and certified for competition use. Reversible red/blue design.",
  },
  "head-protector-preowned": {
    images: [
      `${CDN}/96b7e537-4bab-4911-ba2b-b0a7835d78ba.png`,
    ],
    description:
      "Pre-owned Dual Band Electronic Head Protector. Inspected and recertified. Advanced sensor technology for accurate scoring.",
  },
  "dual-band-receiver-preowned": {
    images: [
      `${CDN}/cea50923-d1a6-4714-9895-9f726ca224b7.jpg`,
    ],
    description:
      "Pre-owned Dual Band Receiver. Tested and fully functional. IEEE 802.15.4 standard with fast data transmission.",
  },
  "judge-scoring-preowned": {
    images: [
      `${CDN}/d1c0ea4c-05d0-4019-9f2c-b7039c15a67c.png`,
    ],
    description:
      "Pre-owned Electronic Judge Scoring System. Fully tested and ready for tournament use.",
  },

  // ═══════════ K2 PSS ═══════════
  "k2-electronic-socks": {
    images: [
      `${CDN}/3cfc1867-e364-4a72-b0ef-9742343b04ca.png`,
      `${CDN}/d7bfda41-d0c4-456e-a5ab-60f62aaae181.webp`,
      `${CDN}/2e47623e-6f98-4d95-9b6f-dc699fd5a683.png`,
    ],
    description:
      "K2 socks are designed with a tighter fit than K1 socks to improve contact detection. Important: K2 components are not compatible with K1 system parts.",
  },
  "k2-receiver-r20": {
    images: [
      `${CDN}/3366464a-23d6-4d54-922b-895b2447959d.png`,
    ],
    description:
      "K2 Receiver R-20 — Next-generation receiver for the KPNP K2 PSS System. Improved wireless connectivity and faster data transfer.",
  },
  "k2-esocks-tester": {
    images: [
      `${CDN}/3cfc1867-e364-4a72-b0ef-9742343b04ca.png`,
    ],
    description:
      "K2 E-Socks Tester — Diagnostic tool for testing and calibrating K2 Electronic Socks before competition.",
  },
  "k2-chest-protector": {
    images: [
      `${CDN}/89bfd325-1cbd-4757-947e-1cabf4fd8afb.png`,
    ],
    description:
      "KPNP PSS K2 Dual Band Electronic Chest Protector — Next-generation chest protector for the K2 system. Coming soon.",
  },
  "k2-ehp": {
    images: [
      `${CDN}/96b7e537-4bab-4911-ba2b-b0a7835d78ba.png`,
    ],
    description:
      "KPNP PSS K2 EHP — Next-generation electronic head protector for the K2 system. Coming soon.",
  },

  // ═══════════ Apparel ═══════════
  "gold-label-tracksuit": {
    images: [
      `${CDN}/a05c8507-0be9-40ee-a2d4-69ce3fef925c.png`,
      `${CDN}/73b63a41-2382-423e-b226-dc6f554436ed.png`,
      `${CDN}/0b07cb26-acba-4f7d-acbc-5155680a0fea.png`,
      `${CDN}/71b99f04-b4d3-4e5e-9abf-e3f5c983718c.png`,
      `${CDN}/d9338fc5-5a4d-4486-9991-d7c1c3bead94.png`,
      `${CDN}/33c1d504-9136-4770-84b9-1bc87f88ca74.png`,
    ],
    description:
      "Top & Pants Set. Exceptionally comfortable and built to last, featuring ultra-soft, flexible material that moves with you. Perfect for workouts, runs, or casual everyday wear. Note: sizes run one size smaller.",
  },
  "tracksuit-grey": {
    images: [],
    description: "KPNP Tracksuit Set (Grey) — Comfortable athletic tracksuit for training and everyday wear. Coming soon.",
  },
  "polo-shirt-black": {
    images: [],
    description: "KPNP Polo Shirt (Black) — Professional style polo for coaches and officials. Coming soon.",
  },
  "drifit-shirt-black": {
    images: [],
    description: "KPNP Dri-Fit Shirt (Black) — Moisture-wicking performance shirt for training. Coming soon.",
  },
  "drifit-shirt-white": {
    images: [],
    description: "KPNP Dri-Fit Shirt (White) — Moisture-wicking performance shirt for training. Coming soon.",
  },
  "neon-green-shorts": {
    images: [],
    description: "KPNP Neon Green Shorts — Lightweight athletic shorts for training. Coming soon.",
  },
  "neongreen-jacket": {
    images: [],
    description: "KPNP Neongreen Black Jacket — Stylish athletic jacket for warm-ups and casual wear. Coming soon.",
  },

  // ═══════════ Uniforms ═══════════
  "black-label-uniform": {
    images: [
      `${CDN}/183e7ca6-d0e1-4547-a678-729b532b74b1.png`,
      `${CDN}/6133d8b5-484e-40fd-97fa-9623d726a3e2.png`,
      `${CDN}/0c4f873e-a943-4876-b873-7a116584e6fc.png`,
      `${CDN}/65393fe7-935b-4568-bc1c-2f186c5f7cfa.png`,
      `${CDN}/f43d9c8e-6ed5-41a2-b195-6bf29e22e138.png`,
      `${CDN}/cd9aeb84-2b69-4c8a-a987-75b24adc6811.png`,
      `${CDN}/f8d35f85-1ee4-4391-8c4f-2671fd4926f9.png`,
      `${CDN}/7b2b9c51-c1cc-4526-bb44-b6afbe8262c8.png`,
    ],
    description:
      "WT Certified — Approved for domestic and international competitions. Innovative fabric technology with specialized mesh construction for breathability and freedom of movement.",
  },
  "blue-label-uniform": {
    images: [
      `${CDN}/508a78b3-8503-4dc0-8e33-b22e1d70a45e.png`,
      `${CDN}/fecef899-f09e-4dd7-ab78-f9a4057549ce.png`,
      `${CDN}/89dc8f8c-d2d9-4a83-8992-8cece24f6ac2.png`,
      `${CDN}/95f7c747-c56c-43c4-8363-d003fc8177f1.png`,
      `${CDN}/a66f4d15-532d-44ed-a834-b5ca7a4ef7c6.png`,
      `${CDN}/a638026f-1187-480d-896b-51747ef3fec9.png`,
      `${CDN}/4febb76b-a763-40a9-ade9-23d86fbad613.png`,
      `${CDN}/48737c9d-fba3-48a3-86d0-fbc27a3069f5.png`,
    ],
    description:
      "WT Certified — Approved for domestic and international competitions. Innovative fabric technology with specialized mesh construction for breathability and freedom of movement.",
  },
  "official-black-belt": {
    images: [
      `${CDN}/adf39e30-f43d-4cbe-a539-eb3d78367e6e.png`,
    ],
    description:
      "KPNP Black Belt Premium — Tradition, Honor and Excellence. Developed with high-quality materials offering strength, durability, and a premium finish. Reinforced fabric with firm structure and precise stitching. More than an accessory, it's a symbol of commitment, respect, and technical excellence.",
  },
  "poomsae-dan-male": {
    images: [
      `${CDN}/478aa9b1-f9e8-4e50-b0a1-556dd923e309.png`,
    ],
    description:
      "KPNP Poomsae Dan Male Dobok — Designed for male Dan-grade poomsae athletes. Lightweight, breathable fabric for comfort, flexibility, and a professional look.",
  },
  "poomsae-dan-female": {
    images: [
      `${CDN}/eee47546-9342-431b-9aa9-062e46636e5c.png`,
      `${CDN}/88e7d342-03f1-4cc5-ab39-60fc8c451043.png`,
      `${CDN}/31faea27-93be-4311-88a5-0eee67707106.png`,
      `${CDN}/6de3ca6b-72ce-4073-a2f6-3f1e7ac4a348.png`,
    ],
    description:
      "KPNP Poomsae Dan Female Dobok — Specially designed for female poomsae athletes, offering a tailored fit that enhances movement and presentation. Made with lightweight, breathable fabric.",
  },
  "poomsae-poom-male": {
    images: [
      `${CDN}/607fc2c5-0f06-418b-b6b7-92cb3ac3b10f.png`,
    ],
    description:
      "KPNP Poomsae Poom Male Dobok — Designed for male Poom-grade poomsae athletes. Lightweight, breathable fabric for comfort and performance.",
  },
  "poomsae-poom-female": {
    images: [
      `${CDN}/cb4f232b-cc57-4bd5-a7c8-b9d89723ce34.png`,
      `${CDN}/e3359395-f006-4b31-ad82-52fcfb515c96.png`,
      `${CDN}/32251eb1-18df-4b35-874e-1a436f2d5db4.png`,
      `${CDN}/7a608984-6b4a-4b86-9594-959b87ed086d.png`,
      `${CDN}/5ee3249f-c872-4406-971c-a44e6a2cd72d.png`,
    ],
    description:
      "KPNP Poomsae Poom Female Dobok — Specially designed for female poomsae athletes, offering a tailored fit that enhances movement and presentation. Comfort, flexibility, and a clean, professional look.",
  },
  "victor-dobok": {
    images: [],
    description: "KPNP Victor Dobok — 100% Polyester uniform for training and competition. Coming soon.",
  },
  "authentic-uniform": {
    images: [],
    description: "KPNP Authentic Uniform — Classic Taekwondo uniform with traditional styling. Coming soon.",
  },
  "ribbed-dobok": {
    images: [],
    description: "KPNP Ribbed Dobok — Modern ribbed-texture uniform for a distinctive look. Coming soon.",
  },
  "jacquard-dobok": {
    images: [],
    description: "KPNP Jacquard Dobok — Premium jacquard-weave uniform with elegant texture. Coming soon.",
  },
  "poomsae-master-dobok": {
    images: [],
    description: "KPNP Poomsae Master Dobok — Premium uniform designed for master-level poomsae practitioners. Coming soon.",
  },

  // ═══════════ Training ═══════════
  "taekwondo-shoes": {
    images: [
      `${CDN}/7f192891-3540-4071-a813-8057d1da6e3d.png`,
    ],
    description:
      "KPNP Performance Taekwondo Shoes — Lightweight, flexible, and designed for optimal grip on the mat. Built for both training and competition.",
  },
  "double-target-mitt": {
    images: [],
    description:
      "KPNP Double Target Mitt — Professional-grade target mitt for precision kicking drills. Dual-sided design for versatile training.",
  },
  "k2-socks": {
    images: [],
    description: "KPNP K2 Socks — Training socks designed for use with the K2 PSS system.",
  },
  "kick-pads": {
    images: [],
    description: "KPNP Martial Arts Kick Pads — Durable kick pads for high-intensity training. Coming soon.",
  },
  "hogu-reversible": {
    images: [],
    description: "KPNP Hogu (Reversible) — Reversible chest protector for training in red and blue. Coming soon.",
  },
  "shin-guards": {
    images: [
      `${CDN}/6853a518-ac78-4a5c-9a28-7f00d21a098d.png`,
    ],
    description: "KPNP Shin Guards — Protective shin guards for sparring and competition.",
  },
  "arm-guard": {
    images: [
      `${CDN}/b3de134c-367a-4c7c-8661-cbe5323d4001.png`,
    ],
    description: "KPNP Arm Guard — Protective arm guards for sparring and competition.",
  },
  "groin-guard-f": {
    images: [
      `${CDN}/5e2c4237-11d2-4452-b304-a3abf8ea260b.png`,
    ],
    description: "KPNP Groin Guard (Female) — Essential protective gear designed for female athletes.",
  },
  "groin-guard-m": {
    images: [
      `${CDN}/8b73c6c9-4894-441a-a4fc-f6515d0d1669.png`,
    ],
    description: "KPNP Groin Guard (Male) — Essential protective gear designed for male athletes.",
  },
  "bl-shin-guard": {
    images: [
      `${CDN}/6853a518-ac78-4a5c-9a28-7f00d21a098d.png`,
    ],
    description: "KPNP Black Label Shin Guard — Premium protective shin guard. Coming soon.",
  },
  "bl-arm-guard": {
    images: [
      `${CDN}/b3de134c-367a-4c7c-8661-cbe5323d4001.png`,
    ],
    description: "KPNP Black Label Arm Guard — Premium protective arm guard. Coming soon.",
  },
  "bl-groin-guard-female": {
    images: [
      `${CDN}/5e2c4237-11d2-4452-b304-a3abf8ea260b.png`,
    ],
    description: "KPNP Black Label Groin Guard (Female) — Premium protective gear for female athletes. Coming soon.",
  },
  "bl-groin-guard-male": {
    images: [
      `${CDN}/8b73c6c9-4894-441a-a4fc-f6515d0d1669.png`,
    ],
    description: "KPNP Black Label Groin Guard (Male) — Premium protective gear for male athletes. Coming soon.",
  },
};
