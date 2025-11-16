import { ShortagePrediction, CallRecord } from "./types";

// In-memory data store
// Note: This resets on server restart - suitable for demo/hackathon
// For production, consider using a database or persistent storage

// Initial mock data (fallback)
const initialPredictions: ShortagePrediction[] = [
  {
    id: "1",
    sku: "VAL-MLK-001",
    productName: "Valio Kevytmaito 1L",
    customerName: "Ravintola Savoy",
    riskScore: 0.87,
    status: "pending",
    orderId: "ORD-2025-1145",
    suggestedReplacements: [
      {
        sku: "VAL-MLK-002",
        productName: "Valio Rasvaton Maito 1L",
        reason: "Same volume, fat-free alternative, same delivery schedule",
        tags: ["fat-free", "1L", "same-day-delivery"],
      },
      {
        sku: "VAL-MLK-003",
        productName: "Valio Luomu Kevytmaito 1L",
        reason: "Organic option, same fat content, premium quality",
        tags: ["organic", "1L", "premium"],
      },
      {
        sku: "VAL-MLK-004",
        productName: "Valio Kevytmaito 2L",
        reason: "Larger pack size, better value, same product line",
        tags: ["2L", "value-pack", "same-product-line"],
      },
    ],
  },
  {
    id: "2",
    sku: "VAL-CRM-005",
    productName: "Valio Ruokakerma 5dl",
    customerName: "Café Helsinki",
    riskScore: 0.65,
    status: "pending",
    orderId: "ORD-2025-1146",
    suggestedReplacements: [
      {
        sku: "VAL-CRM-006",
        productName: "Valio Kuohukerma 5dl",
        reason: "Whipping cream alternative, suitable for hot beverages",
        tags: ["whipping-cream", "5dl", "versatile"],
      },
      {
        sku: "VAL-CRM-007",
        productName: "Valio Ruokakerma 2dl",
        reason: "Smaller pack, same product, immediate availability",
        tags: ["2dl", "in-stock", "same-product"],
      },
    ],
  },
];

const initialCalls: CallRecord[] = [
  {
    id: "call-1",
    time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    customerName: "Ravintola Savoy",
    direction: "outbound",
    language: "fi",
    status: "completed",
    outcome: "replacement_accepted",
    relatedOrderId: "ORD-2025-1145",
    relatedSku: "VAL-MLK-001",
    summary: "Kevytmaito replaced with fat-free milk",
    durationSeconds: 127,
    audioUrl: "https://example.com/audio/call-1.mp3",
    photoUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
    transcript: [
      {
        speaker: "agent",
        text: "Hei, tämä on Valio Aimo. Soitan koskien tilaustanne numero 1145.",
      },
      {
        speaker: "customer",
        text: "Joo hei, kuulen.",
      },
      {
        speaker: "agent",
        text: "Valitettavasti Kevytmaito 1L on loppunut varastostamme. Voimme tarjota tilalle Rasvaton Maito 1L samaan hintaan. Sopisko tämä teille?",
      },
      {
        speaker: "customer",
        text: "Joo, se käy hyvin. Kiitos kun soititte.",
      },
      {
        speaker: "agent",
        text: "Kiitos! Vahvistan muutoksen tilaukseen. Hyvää päivänjatkoa!",
      },
    ],
  },
  {
    id: "call-2",
    time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    customerName: "Café Helsinki",
    direction: "outbound",
    language: "fi",
    status: "completed",
    outcome: "replacement_accepted",
    relatedOrderId: "ORD-2025-1146",
    relatedSku: "VAL-CRM-005",
    summary: "Cooking cream replaced with whipping cream",
    durationSeconds: 98,
    transcript: [
      {
        speaker: "agent",
        text: "Hyvää huomenta, Valio Aimo täällä. Soitan tilauksenne 1146 asiassa.",
      },
      {
        speaker: "customer",
        text: "Selvä, mikä asia?",
      },
      {
        speaker: "agent",
        text: "Ruokakerma 5dl on tilapäisesti loppu. Voisimmeko toimittaa Kuohukermaa tilalle?",
      },
      {
        speaker: "customer",
        text: "Toimii meille, käytämme kahveihin.",
      },
      {
        speaker: "agent",
        text: "Loistavaa! Päivitän tilauksen. Kiitos!",
      },
    ],
  },
  {
    id: "call-3",
    time: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    customerName: "Hotel Kämp Kitchen",
    direction: "inbound",
    language: "en",
    status: "completed",
    outcome: "credits_only",
    relatedOrderId: "ORD-2025-1143",
    relatedSku: null,
    summary: "Customer requested credit for missing yogurt delivery",
    durationSeconds: 156,
    photoUrl: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400",
    transcript: [
      {
        speaker: "customer",
        text: "Hi, this is Hotel Kämp. We're missing yogurt from today's delivery.",
      },
      {
        speaker: "agent",
        text: "I'm sorry to hear that. Let me check your order. Can I have your order number?",
      },
      {
        speaker: "customer",
        text: "It's order 1143.",
      },
      {
        speaker: "agent",
        text: "Thank you. I can see the yogurt wasn't delivered. Would you like a replacement delivery today or a credit?",
      },
      {
        speaker: "customer",
        text: "We'll take the credit. We found another supplier for today.",
      },
      {
        speaker: "agent",
        text: "Understood. I've processed a credit to your account. You'll see it reflected within 24 hours.",
      },
      {
        speaker: "customer",
        text: "Perfect, thank you.",
      },
    ],
  },
  {
    id: "call-4",
    time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    customerName: "Bistro Kluuvi",
    direction: "outbound",
    language: "fi",
    status: "completed",
    outcome: "replacement_accepted",
    relatedOrderId: "ORD-2025-1147",
    relatedSku: "VAL-CHZ-012",
    summary: "Emmental cheese replaced with Edamer",
    durationSeconds: 85,
    transcript: [
      {
        speaker: "agent",
        text: "Päivää, Valio Aimo. Emmental viipale 150g on loppu. Edamer viipale 150g käy tilalle?",
      },
      {
        speaker: "customer",
        text: "Joo, käy hyvin.",
      },
      {
        speaker: "agent",
        text: "Kiitos, vahvistettu!",
      },
    ],
  },
];

// Data store
let predictions: ShortagePrediction[] = [...initialPredictions];
let calls: CallRecord[] = [...initialCalls];

// Get functions
export function getPredictions(): ShortagePrediction[] {
  return [...predictions];
}

export function getCalls(): CallRecord[] {
  return [...calls];
}

// Update functions
export function updatePredictions(newPredictions: ShortagePrediction[]): void {
  predictions = [...newPredictions];
}

export function updateCalls(newCalls: CallRecord[]): void {
  calls = [...newCalls];
}

// Add/update single items
export function addCall(call: CallRecord): void {
  // Check if call with same ID exists, update it, otherwise add
  const existingIndex = calls.findIndex((c) => c.id === call.id);
  if (existingIndex >= 0) {
    calls[existingIndex] = call;
  } else {
    calls.push(call);
  }
  // Keep calls sorted by time (newest first)
  calls.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

export function updatePrediction(prediction: ShortagePrediction): void {
  const existingIndex = predictions.findIndex((p) => p.id === prediction.id);
  if (existingIndex >= 0) {
    predictions[existingIndex] = prediction;
  } else {
    predictions.push(prediction);
  }
}

// Reset to initial data (useful for testing)
export function resetData(): void {
  predictions = [...initialPredictions];
  calls = [...initialCalls];
}

