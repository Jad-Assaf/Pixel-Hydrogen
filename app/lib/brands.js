import acefastLogo from '~/assets/acefast-logo.jpg';
import acerLogo from '~/assets/acer-logo.jpg';
import amazfitLogo from '~/assets/amazfit-logo.jpg';
import amazonLogo from '~/assets/amazon-logo.jpg';
import ankerLogo from '~/assets/anker-logo.webp';
import appleLogo from '~/assets/apple-logo.webp';
import asusLogo from '~/assets/asus-logo.webp';
import aulumuLogo from '~/assets/aulumu.jpg';
import baseusLogo from '~/assets/baseus-logo.jpg';
import beatsLogo from '~/assets/beats-logo.webp';
import belkinLogo from '~/assets/belkin-logo.jpg';
import blackSharkLogo from '~/assets/black-shark-logo.jpg';
import boseLogo from '~/assets/bose-logo.jpg';
import boyaLogo from '~/assets/boya-logo.jpg';
import decodedLogo from '~/assets/decoded-logo.jpg';
import dellLogo from '~/assets/dell-logo.jpg';
import djiLogo from '~/assets/dji-logo.jpg';
import eufyLogo from '~/assets/eufy-logo.jpg';
import fantechLogo from '~/assets/fantech-logo.jpg';
import fujifilmLogo from '~/assets/fujifilm-logo.jpg';
import googleLogo from '~/assets/google-logo.jpg';
import harmanLogo from '~/assets/harman-logo.jpg';
import hocoLogo from '~/assets/hoco-logo.jpg';
import hollylandLogo from '~/assets/hollyland-logo.jpg';
import hpLogo from '~/assets/hp-logo.webp';
import huaweiLogo from '~/assets/huawei-logo.jpg';
import infinixLogo from '~/assets/infinix-logo.jpg';
import jblLogo from '~/assets/jbl-logo.jpg';
import lenovoLogo from '~/assets/lenovo-logo.webp';
import logitechLogo from '~/assets/logitech-logo.jpg';
import mageasyLogo from '~/assets/mageasy-logo.jpg';
import markrydenLogo from '~/assets/markryden.jpg';
import marshallLogo from '~/assets/marshall-logo.jpg';
import microsoftLogo from '~/assets/microsoft-logo.jpg';
import moftLogo from '~/assets/moft.jpg';
import msiLogo from '~/assets/msi-logo.webp';
import nintendoLogo from '~/assets/nintendo-logo.jpg';
import nothingLogo from '~/assets/nothing.jpg';
import philipsLogo from '~/assets/philips.jpg';
import porodoLogo from '~/assets/porodo-logo.jpg';
import powerologyLogo from '~/assets/powerology-logo.jpg';
import promateLogo from '~/assets/promate-logo.jpg';
import razerLogo from '~/assets/razer.jpg';
import samsungLogo from '~/assets/samsung-logo.webp';
import skuucandyLogo from '~/assets/skuucandy-logo.jpg';
import steelseriesLogo from '~/assets/steelseries-logo.jpg';
import torrasLogo from '~/assets/torras-logo.jpg';
import ugreenLogo from '~/assets/ugreen-logo.jpg';
import xiaomiLogo from '~/assets/xiaomi.jpg';

const whoopLogo =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/whoop-logo.jpg?v=1782419794';

const FAMILY_ORDER = [
  'minimal',
  'performance',
  'gaming',
  'mobile',
  'audio',
  'creator',
  'utility',
  'lifestyle',
];

const FAMILY_PROFILES = {
  minimal: {
    familyLabel: 'Minimal Systems',
    layout: 'editorial',
    eyebrow: 'Designed with restraint',
    notes: ['Quiet materials', 'Low visual noise', 'Precision in daily use'],
    focusAreas: [
      {
        title: 'Desk calm',
        copy: 'Pieces that make the work surface cleaner, sharper, and easier to read.',
      },
      {
        title: 'Pocket carry',
        copy: 'Slim accessories that travel light and stay useful without shouting.',
      },
      {
        title: 'Tactile finish',
        copy: 'Materials and details that still feel satisfying after the novelty fades.',
      },
    ],
    productLead:
      'Start with the pieces that make your setup feel lighter, cleaner, and more deliberate.',
    palette: {
      accent: '#94a3b8',
      accentSoft: 'rgba(148, 163, 184, 0.18)',
      ink: '#0f172a',
      surface: '#f8fafc',
      card: 'rgba(255, 255, 255, 0.84)',
      glow: 'rgba(148, 163, 184, 0.25)',
      meshA: 'rgba(255, 255, 255, 0.95)',
      meshB: 'rgba(226, 232, 240, 0.95)',
    },
  },
  performance: {
    familyLabel: 'Performance Computing',
    layout: 'technical',
    eyebrow: 'Built to keep pace',
    notes: [
      'Productivity headroom',
      'Confident thermals',
      'Desk-first ergonomics',
    ],
    focusAreas: [
      {
        title: 'Deep work',
        copy: 'Hardware that stays responsive through tabs, timelines, spreadsheets, and calls.',
      },
      {
        title: 'Hybrid motion',
        copy: 'Portable enough for the move, serious enough for the main desk when docked.',
      },
      {
        title: 'Expansion room',
        copy: 'Systems that leave enough ceiling for the next phase of your workload.',
      },
    ],
    productLead:
      'These are the picks for users who need dependable output, not just impressive spec sheets.',
    palette: {
      accent: '#2563eb',
      accentSoft: 'rgba(37, 99, 235, 0.18)',
      ink: '#0f172a',
      surface: '#eff6ff',
      card: 'rgba(255, 255, 255, 0.88)',
      glow: 'rgba(37, 99, 235, 0.18)',
      meshA: 'rgba(219, 234, 254, 0.95)',
      meshB: 'rgba(239, 246, 255, 0.95)',
    },
  },
  gaming: {
    familyLabel: 'Competitive Gear',
    layout: 'arena',
    eyebrow: 'Speed with attitude',
    notes: ['Low-latency response', 'Aggressive cooling', 'Setup identity'],
    focusAreas: [
      {
        title: 'Match intensity',
        copy: 'Products meant to stay sharp when reaction time matters more than patience.',
      },
      {
        title: 'Stream presence',
        copy: 'Hardware with enough visual character to look intentional on camera.',
      },
      {
        title: 'Long sessions',
        copy: 'Comfort, heat management, and durability for hours that stretch late.',
      },
    ],
    productLead:
      'Pick from the hardware that feels fast, loud, and unmistakably tuned for play.',
    palette: {
      accent: '#22c55e',
      accentSoft: 'rgba(34, 197, 94, 0.18)',
      ink: '#f8fafc',
      surface: '#04130b',
      card: 'rgba(6, 24, 17, 0.82)',
      glow: 'rgba(34, 197, 94, 0.18)',
      meshA: 'rgba(8, 28, 20, 0.95)',
      meshB: 'rgba(5, 16, 12, 0.98)',
    },
  },
  mobile: {
    familyLabel: 'Mobile Ecosystems',
    layout: 'orbital',
    eyebrow: 'Always in motion',
    notes: [
      'Pocket-first design',
      'Battery-minded choices',
      'Connected daily loops',
    ],
    focusAreas: [
      {
        title: 'Everyday carry',
        copy: 'Devices and accessories that spend more time in motion than on display.',
      },
      {
        title: 'Routine sync',
        copy: 'Phones, wearables, and add-ons that make the rest of the day easier to coordinate.',
      },
      {
        title: 'Fast access',
        copy: 'Tools meant for quick capture, quick replies, and quick power top-ups.',
      },
    ],
    productLead:
      'This collection leans into the products that earn space in your pocket, bag, or hand every day.',
    palette: {
      accent: '#3b82f6',
      accentSoft: 'rgba(59, 130, 246, 0.18)',
      ink: '#0f172a',
      surface: '#eef4ff',
      card: 'rgba(255, 255, 255, 0.82)',
      glow: 'rgba(59, 130, 246, 0.18)',
      meshA: 'rgba(224, 231, 255, 0.98)',
      meshB: 'rgba(239, 246, 255, 0.98)',
    },
  },
  audio: {
    familyLabel: 'Sound with Identity',
    layout: 'pulse',
    eyebrow: 'Tuned for feeling',
    notes: [
      'Signature voicing',
      'Long-session comfort',
      'Mood-setting presence',
    ],
    focusAreas: [
      {
        title: 'Commute lift',
        copy: 'Audio that makes movement feel quicker and the outside world easier to ignore.',
      },
      {
        title: 'Room energy',
        copy: 'Speakers and headphones that define the mood instead of fading into the background.',
      },
      {
        title: 'Listening character',
        copy: 'Products chosen for a point of view on sound, not just technical neutrality.',
      },
    ],
    productLead:
      'Move through the collection by the feeling you want: punch, warmth, polish, or pure escape.',
    palette: {
      accent: '#f97316',
      accentSoft: 'rgba(249, 115, 22, 0.18)',
      ink: '#111827',
      surface: '#fff7ed',
      card: 'rgba(255, 255, 255, 0.84)',
      glow: 'rgba(249, 115, 22, 0.18)',
      meshA: 'rgba(255, 237, 213, 0.96)',
      meshB: 'rgba(255, 247, 237, 0.96)',
    },
  },
  creator: {
    familyLabel: 'Creator Tools',
    layout: 'studio',
    eyebrow: 'Capture the signal',
    notes: ['Portable rigs', 'Reliable wireless', 'Image-first choices'],
    focusAreas: [
      {
        title: 'Fast setup',
        copy: 'Tools that let you start shooting, recording, or monitoring without a long ritual.',
      },
      {
        title: 'Clean delivery',
        copy: 'Gear selected for the clarity and stability that hold up after export.',
      },
      {
        title: 'Movement freedom',
        copy: 'Creator kits that work when you leave the studio and start chasing a scene.',
      },
    ],
    productLead:
      'These picks are for creators who care about setup speed, reliability, and visual or audio character.',
    palette: {
      accent: '#0f766e',
      accentSoft: 'rgba(15, 118, 110, 0.18)',
      ink: '#0f172a',
      surface: '#ecfeff',
      card: 'rgba(255, 255, 255, 0.84)',
      glow: 'rgba(15, 118, 110, 0.16)',
      meshA: 'rgba(204, 251, 241, 0.94)',
      meshB: 'rgba(236, 254, 255, 0.98)',
    },
  },
  utility: {
    familyLabel: 'Everyday Utility',
    layout: 'stack',
    eyebrow: 'Problem-solving gear',
    notes: ['Fast charging', 'Cable discipline', 'Useful add-ons'],
    focusAreas: [
      {
        title: 'Desk reset',
        copy: 'The chargers, hubs, stands, and helpers that make the whole workstation cleaner.',
      },
      {
        title: 'Travel ready',
        copy: 'Compact power and accessory kits that keep friction low when you leave the house.',
      },
      {
        title: 'Always covered',
        copy: 'Products that solve ordinary daily annoyances before they become interruptions.',
      },
    ],
    productLead:
      'Think of this collection as infrastructure: the pieces that make the rest of your tech easier to live with.',
    palette: {
      accent: '#0f766e',
      accentSoft: 'rgba(15, 118, 110, 0.18)',
      ink: '#0f172a',
      surface: '#f0fdfa',
      card: 'rgba(255, 255, 255, 0.86)',
      glow: 'rgba(20, 184, 166, 0.16)',
      meshA: 'rgba(204, 251, 241, 0.95)',
      meshB: 'rgba(240, 253, 250, 0.98)',
    },
  },
  lifestyle: {
    familyLabel: 'Daily Lifestyle',
    layout: 'gallery',
    eyebrow: 'Made for the rhythm of real life',
    notes: ['Comfort-led details', 'Travel-aware choices', 'Easy everyday fit'],
    focusAreas: [
      {
        title: 'Home rhythm',
        copy: 'Products that are meant to become part of the room instead of visual clutter.',
      },
      {
        title: 'On-the-go ease',
        copy: 'Design that respects the way people actually move, carry, and store their gear.',
      },
      {
        title: 'Long-term use',
        copy: 'Practical pieces that should still make sense long after impulse fades away.',
      },
    ],
    productLead:
      'Browse the selection that fits everyday routines best: lighter carry, calmer homes, and smoother travel.',
    palette: {
      // accent: '#a16207',
      // accentSoft: 'rgba(161, 98, 7, 0.18)',
      // ink: '#1f2937',
      // surface: '#fffbeb',
      // card: 'rgba(255, 255, 255, 0.86)',
      // glow: 'rgba(161, 98, 7, 0.14)',
      // meshA: 'rgba(254, 243, 199, 0.95)',
      // meshB: 'rgba(255, 251, 235, 0.98)',
    },
  },
};

export function normalizeBrandHandle(handle) {
  return typeof handle === 'string' ? handle.trim().toLowerCase() : '';
}

export function formatBrandCollectionHandle(handle) {
  const rawHandle = normalizeBrandHandle(handle);
  if (!rawHandle || rawHandle === 'apple' || rawHandle.endsWith('-products')) {
    return rawHandle;
  }
  if (rawHandle === 'markryden') {
    return 'mark-ryden-products';
  }
  return `${rawHandle}-products`;
}

function createBrand(config) {
  const family = FAMILY_PROFILES[config.family] || FAMILY_PROFILES.utility;
  const handle = normalizeBrandHandle(config.handle);
  const collectionHandle =
    config.collectionHandle || formatBrandCollectionHandle(handle);

  return {
    ...family,
    ...config,
    handle,
    route: `/brands/${handle}`,
    collectionHandle,
    collectionPath: `/collections/${collectionHandle}`,
    notes: config.notes || family.notes,
    focusAreas: config.focusAreas || family.focusAreas,
    eyebrow: config.eyebrow || family.eyebrow,
    familyLabel: config.familyLabel || family.familyLabel,
    layout: config.layout || family.layout,
    productLead: config.productLead || family.productLead,
    palette: {
      ...family.palette,
      ...(config.palette || {}),
    },
  };
}

export const BRANDS = [
  createBrand({
    name: 'Apple',
    handle: 'apple',
    logo: appleLogo,
    family: 'minimal',
    headline: 'The calmest way to build a daily digital system.',
    summary:
      'Apple works best when every device, accessory, and ritual folds into one quiet loop from pocket to desk.',
    palette: {accent: '#6b7280', accentSoft: 'rgba(107, 114, 128, 0.18)'},
  }),
  createBrand({
    name: 'HP',
    handle: 'hp',
    logo: hpLogo,
    family: 'performance',
    headline: 'Reliable work rigs for study, office, and home.',
    summary:
      'HP fits users who want dependable laptops, peripherals, and accessories that keep the workday moving cleanly.',
    palette: {accent: '#0096d6', accentSoft: 'rgba(0, 150, 214, 0.18)'},
  }),
  createBrand({
    name: 'Lenovo',
    handle: 'lenovo',
    logo: lenovoLogo,
    family: 'performance',
    headline: 'Straight-line productivity with zero unnecessary drama.',
    summary:
      'Lenovo is at its best when the goal is simple: serious output, practical keyboards, and systems built to stay useful.',
    palette: {accent: '#e11d48', accentSoft: 'rgba(225, 29, 72, 0.18)'},
  }),
  createBrand({
    name: 'MSI',
    handle: 'msi',
    logo: msiLogo,
    family: 'gaming',
    headline: 'Power, thermals, and frame-ready confidence.',
    summary:
      'MSI leans into performance-first hardware for players and creators who want headroom without a timid visual language.',
    palette: {
      accent: '#ef4444',
      accentSoft: 'rgba(239, 68, 68, 0.18)',
      glow: 'rgba(239, 68, 68, 0.2)',
    },
  }),
  createBrand({
    name: 'Samsung',
    handle: 'samsung',
    logo: samsungLogo,
    family: 'mobile',
    headline:
      'A future-facing ecosystem that moves from pocket to living room.',
    summary:
      'Samsung spans phones, wearables, displays, and accessories with a design language that stays sleek and high-function.',
    palette: {accent: '#1d4ed8', accentSoft: 'rgba(29, 78, 216, 0.18)'},
  }),
  createBrand({
    name: 'Asus',
    handle: 'asus',
    logo: asusLogo,
    family: 'performance',
    headline: 'Hardware for people who push multitasking past the ordinary.',
    summary:
      'Asus balances practical work machines with enthusiast energy, which makes it fit both ambitious desks and mobile workflows.',
    palette: {accent: '#2563eb', accentSoft: 'rgba(37, 99, 235, 0.18)'},
  }),
  createBrand({
    name: 'Beats',
    handle: 'beats',
    logo: beatsLogo,
    family: 'audio',
    headline: 'Color-first audio built to keep momentum high.',
    summary:
      'Beats makes sense when you want sound with style, presence, and enough punch to turn movement into a mood.',
    palette: {accent: '#dc2626', accentSoft: 'rgba(220, 38, 38, 0.18)'},
  }),
  createBrand({
    name: 'Anker',
    handle: 'anker',
    logo: ankerLogo,
    family: 'utility',
    headline: 'Power gear that removes friction from the day.',
    summary:
      'Anker is the brand you reach for when reliability matters more than novelty and every cable, battery, or brick needs to just work.',
    palette: {accent: '#2563eb', accentSoft: 'rgba(37, 99, 235, 0.18)'},
  }),
  createBrand({
    name: 'Aulumu',
    handle: 'aulumu',
    logo: aulumuLogo,
    family: 'minimal',
    headline:
      'Industrial accessories with sculpted materials and collector energy.',
    summary:
      'Aulumu lives in the space between tool and object, where metal, silhouette, and detail all need to feel intentional.',
    palette: {accent: '#b45309', accentSoft: 'rgba(180, 83, 9, 0.18)'},
  }),
  createBrand({
    name: 'Mark Ryden',
    handle: 'markryden',
    logo: markrydenLogo,
    family: 'lifestyle',
    headline: 'Smart carry for commuters, creators, and travel days.',
    summary:
      'Mark Ryden is about organizing movement well, with bags and carry solutions that treat everyday transit like a real use case.',
    collectionHandle: 'mark-ryden-products',
    palette: {accent: '#334155', accentSoft: 'rgba(51, 65, 85, 0.18)'},
  }),
  createBrand({
    name: 'Moft',
    handle: 'moft',
    logo: moftLogo,
    family: 'minimal',
    headline: 'Origami-smart tools that disappear until you need them.',
    summary:
      'Moft stands out when form factor matters, especially for users who want function hidden inside a slimmer carry.',
    palette: {accent: '#f97316', accentSoft: 'rgba(249, 115, 22, 0.18)'},
  }),
  createBrand({
    name: 'Nothing',
    handle: 'nothing',
    logo: nothingLogo,
    family: 'minimal',
    headline: 'Tech that stays playful by making the inside visible.',
    summary:
      'Nothing brings a lighter, more expressive design language to everyday devices without losing the clean silhouette.',
    palette: {
      accent: '#111827',
      accentSoft: 'rgba(17, 24, 39, 0.18)',
      surface: '#f8fafc',
    },
  }),
  createBrand({
    name: 'Philips',
    handle: 'philips',
    logo: philipsLogo,
    family: 'lifestyle',
    headline: 'Trusted home tech and personal gear built around comfort.',
    summary:
      'Philips fits buyers who want familiarity, ease, and dependable daily-use products instead of an experimental edge.',
    palette: {accent: '#2563eb', accentSoft: 'rgba(37, 99, 235, 0.18)'},
  }),
  createBrand({
    name: 'Powerology',
    handle: 'powerology',
    logo: powerologyLogo,
    family: 'utility',
    headline: 'Utility-driven gadgets built around the power equation.',
    summary:
      'Powerology is strongest when it solves practical energy needs across desks, travel bags, and multi-device routines.',
    palette: {accent: '#f97316', accentSoft: 'rgba(249, 115, 22, 0.18)'},
  }),
  createBrand({
    name: 'Razer',
    handle: 'razer',
    logo: razerLogo,
    family: 'gaming',
    headline: 'Competitive hardware with sharp lines and neon confidence.',
    summary:
      'Razer is for setups that want speed, presence, and a clear visual identity instead of neutral invisibility.',
    palette: {
      accent: '#44d62c',
      accentSoft: 'rgba(68, 214, 44, 0.18)',
      glow: 'rgba(68, 214, 44, 0.22)',
    },
  }),
  createBrand({
    name: 'Xiaomi',
    handle: 'xiaomi',
    logo: xiaomiLogo,
    family: 'mobile',
    headline: 'Ambitious features delivered with value-minded energy.',
    summary:
      'Xiaomi makes sense for shoppers who want more capability per dollar across phones, smart devices, and daily tech helpers.',
    palette: {accent: '#f97316', accentSoft: 'rgba(249, 115, 22, 0.18)'},
  }),
  createBrand({
    name: 'ACEFAST',
    handle: 'acefast',
    logo: acefastLogo,
    family: 'utility',
    headline: 'Fast-charging gear with brighter color and less compromise.',
    summary:
      'ACEFAST feels most at home in mobile setups that need lively accessory design and reliable everyday charging speed.',
    palette: {accent: '#ea580c', accentSoft: 'rgba(234, 88, 12, 0.18)'},
  }),
  createBrand({
    name: 'Acer',
    handle: 'acer',
    logo: acerLogo,
    family: 'performance',
    headline: 'Accessible performance for school, work, and starter gaming.',
    summary:
      'Acer serves users who want real capability without stepping immediately into the most premium price bracket.',
    palette: {accent: '#84cc16', accentSoft: 'rgba(132, 204, 22, 0.18)'},
  }),
  createBrand({
    name: 'Amazfit',
    handle: 'amazfit',
    logo: amazfitLogo,
    family: 'mobile',
    headline: 'Wearables that turn health and motion into signal.',
    summary:
      'Amazfit is built for users who track movement, recovery, and routine through devices that stay close all day.',
    palette: {accent: '#e11d48', accentSoft: 'rgba(225, 29, 72, 0.18)'},
  }),
  createBrand({
    name: 'Amazon',
    handle: 'amazon',
    logo: amazonLogo,
    family: 'utility',
    headline: 'Home devices and everyday tech made to blend into routine.',
    summary:
      'Amazon-branded tech is strongest when it becomes part of the background and keeps convenience within easy reach.',
    palette: {accent: '#f59e0b', accentSoft: 'rgba(245, 158, 11, 0.18)'},
  }),
  createBrand({
    name: 'Baseus',
    handle: 'baseus',
    logo: baseusLogo,
    family: 'utility',
    headline: 'Dense, practical accessories for desks, cars, and travel kits.',
    summary:
      'Baseus tends to win on versatility, especially for people assembling a whole ecosystem of small but useful helpers.',
    palette: {accent: '#2563eb', accentSoft: 'rgba(37, 99, 235, 0.18)'},
  }),
  createBrand({
    name: 'Belkin',
    handle: 'belkin',
    logo: belkinLogo,
    family: 'utility',
    headline:
      'Dependable connections across charging, cables, and daily networking.',
    summary:
      'Belkin fits the user who wants calm, trustworthy accessory choices that integrate neatly into work and home setups.',
    palette: {accent: '#059669', accentSoft: 'rgba(5, 150, 105, 0.18)'},
  }),
  createBrand({
    name: 'Black Shark',
    handle: 'black-shark',
    logo: blackSharkLogo,
    family: 'gaming',
    headline: 'Mobile gaming hardware aimed at cooling, control, and response.',
    summary:
      'Black Shark is built for players who want their phone setup to feel more like a dedicated gaming rig.',
    palette: {
      accent: '#22c55e',
      accentSoft: 'rgba(34, 197, 94, 0.18)',
      glow: 'rgba(34, 197, 94, 0.22)',
    },
  }),
  createBrand({
    name: 'Bose',
    handle: 'bose',
    logo: boseLogo,
    family: 'audio',
    headline: 'Sound sculpted for immersion, balance, and quiet focus.',
    summary:
      'Bose works best when comfort, polish, and a smooth listening experience matter more than hype-heavy tuning.',
    palette: {accent: '#111827', accentSoft: 'rgba(17, 24, 39, 0.18)'},
  }),
  createBrand({
    name: 'BOYA',
    handle: 'boya',
    logo: boyaLogo,
    family: 'creator',
    headline: 'Audio tools that help creators sound clearer, faster.',
    summary:
      'BOYA is a practical starting point for microphones and creator audio kits that need to be easy to deploy.',
    palette: {accent: '#2563eb', accentSoft: 'rgba(37, 99, 235, 0.18)'},
  }),
  createBrand({
    name: 'Decoded',
    handle: 'decoded',
    logo: decodedLogo,
    family: 'minimal',
    headline: 'Premium carry pieces where finish, fit, and texture matter.',
    summary:
      'Decoded belongs in the setup of users who want accessory materials to feel more elevated without becoming flashy.',
    palette: {accent: '#8b5e3c', accentSoft: 'rgba(139, 94, 60, 0.18)'},
  }),
  createBrand({
    name: 'Dell',
    handle: 'dell',
    logo: dellLogo,
    family: 'performance',
    headline: 'Workhorse machines and peripherals built for dependable output.',
    summary:
      'Dell is the choice for people who want practical performance, predictable reliability, and a setup that scales with responsibility.',
    palette: {accent: '#0076ce', accentSoft: 'rgba(0, 118, 206, 0.18)'},
  }),
  createBrand({
    name: 'DJI',
    handle: 'dji',
    logo: djiLogo,
    family: 'creator',
    headline:
      'Flight, stabilization, and camera tools built to unlock movement.',
    summary:
      'DJI turns mobility into image-making power, whether the goal is smoother capture, aerial perspective, or faster production flow.',
    palette: {accent: '#111827', accentSoft: 'rgba(17, 24, 39, 0.18)'},
  }),
  createBrand({
    name: 'Eufy',
    handle: 'eufy',
    logo: eufyLogo,
    family: 'lifestyle',
    headline: 'Smart home gear designed to feel helpful instead of noisy.',
    summary:
      'Eufy fits households that want automation and security without turning the room into a tech showcase.',
    palette: {accent: '#2563eb', accentSoft: 'rgba(37, 99, 235, 0.18)'},
  }),
  createBrand({
    name: 'Fantech',
    handle: 'fantech',
    logo: fantechLogo,
    family: 'gaming',
    headline:
      'Gaming peripherals with bold styling and accessible performance.',
    summary:
      'Fantech makes sense for users building an expressive gaming setup without aiming only at the highest price tier.',
    palette: {
      accent: '#f97316',
      accentSoft: 'rgba(249, 115, 22, 0.18)',
      glow: 'rgba(249, 115, 22, 0.22)',
    },
  }),
  createBrand({
    name: 'Fujifilm',
    handle: 'fujifilm',
    logo: fujifilmLogo,
    family: 'creator',
    headline:
      'Imaging gear where color science and tactile control still matter.',
    summary:
      'Fujifilm attracts photographers and filmmakers who care about both image character and the feel of the tool in hand.',
    palette: {accent: '#dc2626', accentSoft: 'rgba(220, 38, 38, 0.18)'},
  }),
  createBrand({
    name: 'Google',
    handle: 'google',
    logo: googleLogo,
    family: 'mobile',
    headline:
      'AI-shaped devices that keep search, photos, and life in one loop.',
    summary:
      'Google makes sense when software intelligence, fast capture, and seamless account-level continuity are the real priorities.',
    palette: {accent: '#34a853', accentSoft: 'rgba(52, 168, 83, 0.18)'},
  }),
  createBrand({
    name: 'Harman',
    handle: 'harman',
    logo: harmanLogo,
    family: 'audio',
    headline: 'Audio heritage focused on balance, polish, and presence.',
    summary:
      'Harman points toward a more refined listening experience, where the brand story is tied to sound maturity and engineering depth.',
    palette: {accent: '#2563eb', accentSoft: 'rgba(37, 99, 235, 0.18)'},
  }),
  createBrand({
    name: 'Hoco',
    handle: 'hoco',
    logo: hocoLogo,
    family: 'utility',
    headline:
      'Fast-moving accessory basics for charging, audio, and daily use.',
    summary:
      'Hoco works for shoppers who want broad, practical options across the small essentials that keep devices moving.',
    palette: {accent: '#0ea5e9', accentSoft: 'rgba(14, 165, 233, 0.18)'},
  }),
  createBrand({
    name: 'Hollyland',
    handle: 'hollyland',
    logo: hollylandLogo,
    family: 'creator',
    headline: 'Wireless creator gear aimed at clean signal and fast setup.',
    summary:
      'Hollyland suits mobile crews, interview setups, and content teams that need audio or monitoring to stay stable on the move.',
    palette: {accent: '#f59e0b', accentSoft: 'rgba(245, 158, 11, 0.18)'},
  }),
  createBrand({
    name: 'Huawei',
    handle: 'huawei',
    logo: huaweiLogo,
    family: 'performance',
    headline: 'Elegant hardware balancing design, battery, and productivity.',
    summary:
      'Huawei sits well in setups that want premium industrial design paired with a practical, day-long work rhythm.',
    palette: {accent: '#cf0a2c', accentSoft: 'rgba(207, 10, 44, 0.18)'},
  }),
  createBrand({
    name: 'Infinix',
    handle: 'infinix',
    logo: infinixLogo,
    family: 'mobile',
    headline: 'Feature-heavy mobile tech with youthful energy.',
    summary:
      'Infinix is about ambitious mobile value, especially for users who want punchier specs and bold styling at accessible prices.',
    palette: {accent: '#10b981', accentSoft: 'rgba(16, 185, 129, 0.18)'},
  }),
  createBrand({
    name: 'JBL',
    handle: 'jbl',
    logo: jblLogo,
    family: 'audio',
    headline: 'Punchy sound designed for movement, parties, and outdoor life.',
    summary:
      'JBL shines when the goal is energy: more bass, more portability, and more audio that wants to be shared.',
    palette: {accent: '#f97316', accentSoft: 'rgba(249, 115, 22, 0.18)'},
  }),
  createBrand({
    name: 'Logitech',
    handle: 'logitech',
    logo: logitechLogo,
    family: 'gaming',
    headline: 'Precision tools for desks, streams, and competitive setups.',
    summary:
      'Logitech lives at the intersection of performance peripherals and polished work tools, which makes it unusually versatile.',
    palette: {
      accent: '#00b8fc',
      accentSoft: 'rgba(0, 184, 252, 0.18)',
      glow: 'rgba(0, 184, 252, 0.22)',
    },
  }),
  createBrand({
    name: 'Mageasy',
    handle: 'mageasy',
    logo: mageasyLogo,
    family: 'minimal',
    headline: 'Minimal protection that keeps the device front and center.',
    summary:
      'Mageasy is for users who want cases and accessories to protect cleanly without turning the product into something bulky.',
    palette: {accent: '#d97706', accentSoft: 'rgba(217, 119, 6, 0.18)'},
  }),
  createBrand({
    name: 'Marshall',
    handle: 'marshall',
    logo: marshallLogo,
    family: 'audio',
    headline: 'Vintage stage attitude translated into room-ready audio.',
    summary:
      'Marshall is what you choose when sound matters, but so does the object itself and the character it adds to the space.',
    palette: {accent: '#a16207', accentSoft: 'rgba(161, 98, 7, 0.18)'},
  }),
  createBrand({
    name: 'Microsoft',
    handle: 'microsoft',
    logo: microsoftLogo,
    family: 'performance',
    headline: 'Software-minded hardware that keeps productivity fluid.',
    summary:
      'Microsoft fits users who want devices built around workflow clarity, clean collaboration, and understated capability.',
    palette: {accent: '#0ea5e9', accentSoft: 'rgba(14, 165, 233, 0.18)'},
  }),
  createBrand({
    name: 'Nintendo',
    handle: 'nintendo',
    logo: nintendoLogo,
    family: 'gaming',
    headline:
      'Playful systems built around character, surprise, and shared moments.',
    summary:
      'Nintendo stands apart by prioritizing delight, portability, and memorable worlds over spec-sheet aggression.',
    palette: {
      accent: '#ef4444',
      accentSoft: 'rgba(239, 68, 68, 0.18)',
      glow: 'rgba(239, 68, 68, 0.2)',
    },
  }),
  createBrand({
    name: 'Porodo',
    handle: 'porodo',
    logo: porodoLogo,
    family: 'utility',
    headline:
      'Everyday electronics and accessories built for broad practical needs.',
    summary:
      'Porodo is about coverage: the useful tools and gadgets that keep a modern setup filled in without overcomplication.',
    palette: {accent: '#0ea5e9', accentSoft: 'rgba(14, 165, 233, 0.18)'},
  }),
  createBrand({
    name: 'Promate',
    handle: 'promate',
    logo: promateLogo,
    family: 'utility',
    headline: 'Daily tech essentials built around convenience and speed.',
    summary:
      'Promate makes sense for shoppers who want accessible solutions across the wide middle of everyday accessories.',
    palette: {accent: '#22c55e', accentSoft: 'rgba(34, 197, 94, 0.18)'},
  }),
  createBrand({
    name: 'Skuucandy',
    handle: 'skuucandy',
    logo: skuucandyLogo,
    family: 'audio',
    headline: 'Bass-forward audio with casual energy and streetwear attitude.',
    summary:
      'Skuucandy fits listeners who want more personality, stronger low-end emphasis, and a less formal feel to their gear.',
    palette: {accent: '#ec4899', accentSoft: 'rgba(236, 72, 153, 0.18)'},
  }),
  createBrand({
    name: 'SteelSeries',
    handle: 'steelseries',
    logo: steelseriesLogo,
    family: 'gaming',
    headline: 'Esports-grade gear built around reaction and repeatability.',
    summary:
      'SteelSeries is for competitive users who care about consistent comfort and performance more than decorative excess.',
    palette: {
      accent: '#f59e0b',
      accentSoft: 'rgba(245, 158, 11, 0.18)',
      glow: 'rgba(245, 158, 11, 0.2)',
    },
  }),
  createBrand({
    name: 'Torras',
    handle: 'torras',
    logo: torrasLogo,
    family: 'minimal',
    headline: 'Protective accessories with a cleaner, more premium silhouette.',
    summary:
      'Torras belongs in the hands of users who want protection, grip, and polish without making the device feel heavier than it should.',
    palette: {accent: '#60a5fa', accentSoft: 'rgba(96, 165, 250, 0.18)'},
  }),
  createBrand({
    name: 'UGREEN',
    handle: 'ugreen',
    logo: ugreenLogo,
    family: 'utility',
    headline:
      'No-nonsense connectivity and charging gear that overdelivers on utility.',
    summary:
      'UGREEN is what you buy when the setup problem is obvious and you want a compact, capable solution without drama.',
    palette: {accent: '#16a34a', accentSoft: 'rgba(22, 163, 74, 0.18)'},
  }),
  createBrand({
    name: 'WHOOP',
    handle: 'whoop',
    logo: whoopLogo,
    family: 'lifestyle',
    headline: 'Wearable performance gear built around recovery and readiness.',
    summary:
      'WHOOP fits users who want health tracking to feel focused, durable, and easy to wear every day.',
    palette: {accent: '#d7ff00', accentSoft: 'rgba(215, 255, 0, 0.18)'},
  }),
];

const BRANDS_BY_HANDLE = new Map(BRANDS.map((brand) => [brand.handle, brand]));
const BRANDS_BY_COLLECTION_HANDLE = new Map(
  BRANDS.map((brand) => [brand.collectionHandle, brand]),
);

export function getBrandByHandle(handle) {
  return BRANDS_BY_HANDLE.get(normalizeBrandHandle(handle)) || null;
}

export function getBrandByCollectionHandle(handle) {
  const normalized = normalizeBrandHandle(handle);
  if (!normalized) return null;

  return (
    BRANDS_BY_COLLECTION_HANDLE.get(normalized) ||
    BRANDS_BY_COLLECTION_HANDLE.get(formatBrandCollectionHandle(normalized)) ||
    null
  );
}

export function getBrandRoute(handle) {
  const brand = typeof handle === 'string' ? getBrandByHandle(handle) : handle;
  return brand ? brand.route : '/brands';
}

export function groupBrandsByFamily(brands = BRANDS) {
  const grouped = FAMILY_ORDER.map((family) => ({
    family,
    label: FAMILY_PROFILES[family]?.familyLabel || family,
    brands: brands.filter((brand) => brand.family === family),
  })).filter((entry) => entry.brands.length);

  return grouped;
}
