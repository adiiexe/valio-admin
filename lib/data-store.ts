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
  {
    id: "3",
    sku: "VAL-CHZ-012",
    productName: "Valio Emmental viipale 150g",
    customerName: "Bistro Kluuvi",
    riskScore: 0.43,
    status: "pending",
    orderId: "ORD-2025-1147",
    suggestedReplacements: [
      {
        sku: "VAL-CHZ-013",
        productName: "Valio Emmental 200g",
        reason: "Larger pack, same cheese, better unit price",
        tags: ["200g", "value", "same-cheese"],
      },
      {
        sku: "VAL-CHZ-014",
        productName: "Valio Edamer viipale 150g",
        reason: "Similar taste profile, same pack size, melts well",
        tags: ["150g", "similar-taste", "melt-friendly"],
      },
    ],
  },
  {
    id: "4",
    sku: "VAL-FSH-021",
    productName: "Lohifilee 500g",
    customerName: "Hotel Kämp Kitchen",
    riskScore: 0.91,
    status: "pending",
    orderId: "ORD-2025-1148",
    suggestedReplacements: [
      {
        sku: "VAL-FSH-022",
        productName: "Premium Lohifilee 500g",
        reason: "Higher grade salmon, same weight, excellent quality",
        tags: ["premium", "500g", "high-quality"],
      },
      {
        sku: "VAL-FSH-023",
        productName: "Kirjolohi filee 500g",
        reason: "Rainbow trout alternative, similar texture and taste",
        tags: ["trout", "500g", "similar-taste"],
      },
      {
        sku: "VAL-FSH-024",
        productName: "Lohifilee 750g",
        reason: "Larger portion, same product, can be portioned",
        tags: ["750g", "portionable", "same-product"],
      },
    ],
  },
  {
    id: "5",
    sku: "VAL-BTR-030",
    productName: "Valio Voi 500g",
    customerName: "Ravintola Olo",
    riskScore: 0.28,
    status: "resolved",
    orderId: "ORD-2025-1149",
    suggestedReplacements: [
      {
        sku: "VAL-BTR-031",
        productName: "Valio Voi 250g",
        reason: "Half size, same butter, multiple packs available",
        tags: ["250g", "multiple-packs", "same-product"],
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
  {
    id: "call-5",
    time: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    customerName: "Ravintola Nokka",
    direction: "outbound",
    language: "fi",
    status: "completed",
    outcome: "replacement_declined",
    relatedOrderId: "ORD-2025-1142",
    relatedSku: "VAL-YGT-040",
    summary: "Customer declined yogurt replacement",
    durationSeconds: 112,
    transcript: [
      {
        speaker: "agent",
        text: "Hei, Valio Aimo täällä. Luomujogurtti on loppu. Tarjoamme tavallista jogurttia tilalle?",
      },
      {
        speaker: "customer",
        text: "Ei käy, meillä on luomu-menu. Voitteko toimittaa huomenna?",
      },
      {
        speaker: "agent",
        text: "Kyllä, saamme lisää huomenna. Siirränkö tilauksen huomiseen?",
      },
      {
        speaker: "customer",
        text: "Kyllä kiitos.",
      },
      {
        speaker: "agent",
        text: "Selvä, näin teen. Hyvää päivänjatkoa!",
      },
    ],
  },
  {
    id: "call-6",
    time: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    customerName: "Café Regatta",
    direction: "outbound",
    language: "sv",
    status: "completed",
    outcome: "no_answer",
    relatedOrderId: "ORD-2025-1141",
    relatedSku: "VAL-MLK-008",
    summary: "No answer, left voicemail",
    durationSeconds: 32,
    transcript: [
      {
        speaker: "agent",
        text: "Hej, detta är Valio Aimo. Vi försöker nå er angående order 1141. Vänligen ring tillbaka.",
      },
    ],
  },
  {
    id: "call-7",
    time: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    customerName: "Ravintola Olo",
    direction: "inbound",
    language: "fi",
    status: "completed",
    outcome: "replacement_accepted",
    relatedOrderId: "ORD-2025-1149",
    relatedSku: "VAL-BTR-030",
    summary: "Customer accepted butter pack size change",
    durationSeconds: 67,
    transcript: [
      {
        speaker: "customer",
        text: "Hei, sain viestin että voi 500g on loppu?",
      },
      {
        speaker: "agent",
        text: "Kyllä, mutta voimme lähettää kaksi 250g pakkausta tilalle. Sopii?",
      },
      {
        speaker: "customer",
        text: "Joo, toimii.",
      },
      {
        speaker: "agent",
        text: "Kiitos, vahvistettu!",
      },
    ],
  },
  {
    id: "call-8",
    time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    customerName: "Hotel Kämp Kitchen",
    direction: "outbound",
    language: "en",
    status: "in_progress",
    outcome: "replacement_accepted",
    relatedOrderId: "ORD-2025-1148",
    relatedSku: "VAL-FSH-021",
    summary: "Discussing salmon fillet replacement",
    durationSeconds: 0,
    transcript: [
      {
        speaker: "agent",
        text: "Hello, this is Valio Aimo calling about order 1148...",
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

