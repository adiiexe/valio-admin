export type Language = "fi" | "en";

export const translations = {
  fi: {
    // Navigation
    dashboard: "Hallintapaneeli",
    shortages: "Puutteet",
    callsNav: "Puhelut",
    settings: "Asetukset",
    
    // Dashboard Overview
    welcomeBack: "Tervetuloa takaisin",
    dashboardSubtitle: "Tässä on tämän päivän tapahtumat",
    activeRisks: "Aktiiviset riskit",
    aiCallsToday: "AI-puhelut tänään",
    acceptanceRate: "Hyväksymisaste",
    resolvedToday: "Ratkaistu tänään",
    fromYesterday: "eilisestä",
    lastCall: "Viimeisin puhelu",
    ago: "sitten",
    fromLastWeek: "viime viikosta",
    pendingAction: "odottaa toimenpidettä",
    
    // Quick Actions
    quickActions: "Pikatoiminnot",
    viewShortages: "Näytä puutteet",
    activeRisksCount: "aktiivista riskiä",
    viewAllCalls: "Näytä kaikki puhelut",
    total: "yhteensä",
    viewAnalytics: "Näytä analytiikka",
    performanceMetrics: "Suorituskykymittarit",
    
    // Recent Activity
    recentActivity: "Viimeisimmät tapahtumat",
    viewAll: "Näytä kaikki →",
    
    // Shortages Page
    predictedShortages: "Ennustetut puutteet",
    manageShortages: "Hallinnoi ja seuraa ennustettuja varastopuutteita",
    
    // Shortages Table
    product: "Tuote",
    customer: "Asiakas",
    risk: "Riski",
    status: "Tila",
    action: "Toiminto",
    details: "Yksityiskohdat",
    high: "Korkea",
    medium: "Keskitaso",
    low: "Matala",
    pending: "Odottaa",
    resolved: "Ratkaistu",
    
    // Shortage Details
    shortageDetails: "Puutteen yksityiskohdat",
    reviewShortage: "Tarkista ja ryhdy toimenpiteisiin ennustetun puutteen osalta",
    sku: "Tuotekoodi",
    order: "Tilaus",
    riskScore: "Riskipistemäärä",
    aiReplacementSuggestions: "AI:n korvausehdotukset",
    recommended: "Suositeltu",
    triggerAiCall: "Käynnistä AI-puhelu",
    triggering: "Käynnistetään...",
    markResolved: "Merkitse ratkaistuksi",
    removeShortage: "Poista puute",
    
    // Calls Page
    aiCalls: "AI-puhelut",
    viewAllCallsSubtitle: "Näytä kaikki saapuvat ja lähtevät asiakaspuhelut",
    outboundCalls: "Lähtevät puhelut",
    inboundCalls: "Saapuvat puhelut",
    calls: "puhelua",
    time: "Aika",
    noCallsYet: "Ei puheluja vielä",
    view: "Näytä",
    
    // Call Status
    completed: "Valmis",
    failed: "Epäonnistui",
    inProgress: "Käynnissä",
    
    // Call Outcomes
    outcome: "Tulos",
    accepted: "✓ Hyväksytty",
    credits: "$ Luotto",
    incomplete: "— Keskeneräinen",
    
    // Call Details
    callConversation: "Puhelun keskustelu",
    transcript: "Puhelun teksti",
    aiAgent: "AI-agentti",
    callRecording: "Puhelun tallenne",
    willBeAvailable: "Tulee saataville n8n:n kautta ElevenLabsista",
    noTranscriptAvailable: "Transkriptiä ei saatavilla",
    loadingAudio: "Ladataan äänitiedostoa...",
    audioNotAvailable: "Äänitiedosto ei saatavilla",
    photoOfMissingProduct: "Puuttuvan tuotteen kuva",
    callId: "Puhelun ID",
    relatedOrder: "Liittyvä tilaus",
    relatedSku: "Liittyvä tuotekoodi",
    outbound: "Lähtevä",
    inbound: "Saapuva",
    
    // Settings Page
    configureDashboard: "Määritä hallintapaneeli ja integraatiot",
    settingsPanelComingSoon: "Asetusikkuna tulossa pian...",
    
    // Toast Messages
    error: "Virhe",
    failedToLoadData: "Tietojen lataaminen epäonnistui",
    aiCallTriggered: "AI-puhelu käynnistetty",
    calling: "Soitetaan",
    about: "koskien",
    failedToTriggerCall: "AI-puhelun käynnistäminen epäonnistui",
    markedResolved: "Merkitty ratkaistuksi",
    newCallReceived: "Uusi puhelu vastaanotettu",
    callFrom: "Puhelu käyttäjältä",
    
    // Demo Mode
    demoMode: "Demo-tila",
    
    // Date/Time
    loading: "Ladataan...",
  },
  en: {
    // Navigation
    dashboard: "Dashboard",
    shortages: "Shortages",
    callsNav: "Calls",
    settings: "Settings",
    
    // Dashboard Overview
    welcomeBack: "Welcome back",
    dashboardSubtitle: "Here's what's happening with your operations today",
    activeRisks: "Active Risks",
    aiCallsToday: "AI Calls Today",
    acceptanceRate: "Acceptance Rate",
    resolvedToday: "Resolved Today",
    fromYesterday: "from yesterday",
    lastCall: "Last call",
    ago: "ago",
    fromLastWeek: "from last week",
    pendingAction: "pending action",
    
    // Quick Actions
    quickActions: "Quick Actions",
    viewShortages: "View Shortages",
    activeRisksCount: "active risks",
    viewAllCalls: "View All Calls",
    total: "total",
    viewAnalytics: "View Analytics",
    performanceMetrics: "Performance metrics",
    
    // Recent Activity
    recentActivity: "Recent Activity",
    viewAll: "View all →",
    
    // Shortages Page
    predictedShortages: "Predicted Shortages",
    manageShortages: "Manage and monitor predicted inventory shortages",
    
    // Shortages Table
    product: "Product",
    customer: "Customer",
    risk: "Risk",
    status: "Status",
    action: "Action",
    details: "Details",
    high: "High",
    medium: "Medium",
    low: "Low",
    pending: "Pending",
    resolved: "Resolved",
    
    // Shortage Details
    shortageDetails: "Shortage Details",
    reviewShortage: "Review and take action on predicted shortage",
    sku: "SKU",
    order: "Order",
    riskScore: "Risk Score",
    aiReplacementSuggestions: "AI Replacement Suggestions",
    recommended: "Recommended",
    triggerAiCall: "Trigger AI Call",
    triggering: "Triggering...",
    markResolved: "Mark Resolved",
    removeShortage: "Remove Shortage",
    
    // Calls Page
    aiCalls: "AI Calls",
    viewAllCallsSubtitle: "View all inbound and outbound customer calls",
    outboundCalls: "Outbound Calls",
    inboundCalls: "Inbound Calls",
    calls: "calls",
    time: "Time",
    noCallsYet: "No calls yet",
    view: "View",
    
    // Call Status
    completed: "Completed",
    failed: "Failed",
    inProgress: "In Progress",
    
    // Call Outcomes
    outcome: "Outcome",
    accepted: "✓ Accepted",
    credits: "$ Credits",
    incomplete: "— Incomplete",
    
    // Call Details
    callConversation: "Call Conversation",
    transcript: "Transcript",
    aiAgent: "AI Agent",
    callRecording: "Call Recording",
    willBeAvailable: "Will be available via n8n from ElevenLabs",
    noTranscriptAvailable: "No transcript available",
    loadingAudio: "Loading audio...",
    audioNotAvailable: "Audio not available",
    photoOfMissingProduct: "Photo of Missing Product",
    callId: "Call ID",
    relatedOrder: "Related Order",
    relatedSku: "Related SKU",
    outbound: "Outbound",
    inbound: "Inbound",
    
    // Settings Page
    configureDashboard: "Configure your dashboard and integrations",
    settingsPanelComingSoon: "Settings panel coming soon...",
    
    // Toast Messages
    error: "Error",
    failedToLoadData: "Failed to load dashboard data",
    aiCallTriggered: "AI Call Triggered",
    calling: "Calling",
    about: "about",
    failedToTriggerCall: "Failed to trigger AI call",
    markedResolved: "Marked Resolved",
    newCallReceived: "New Call Received",
    callFrom: "Call from",
    
    // Demo Mode
    demoMode: "Demo Mode",
    
    // Date/Time
    loading: "Loading...",
  },
} as const;

export function getTranslations(lang: Language) {
  return translations[lang];
}

export type TranslationKey = keyof typeof translations.en;

