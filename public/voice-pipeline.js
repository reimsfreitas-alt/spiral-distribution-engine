(function (root) {
  "use strict";

  const COMMAND_PATTERNS = [
    /\bpublic\w*\b/i, /\bpubliqu\w*\b/i, /\bdistribu\w*\b/i,
    /\benvi\w*\b/i, /\bpost\w*\b/i, /\bpublish\w*\b/i,
    /\bdistribute\w*\b/i, /\bsend\w*\b/i, /\bcriar?\s+campanha\b/i,
    /\bcreate\s+campaign\b/i
  ];
  const AUTHORIZATION_PATTERNS = [
    /\bautoriz[oa]r?\b/i, /\bconfirm[oa]r?\b/i, /\bpode\s+publicar\b/i,
    /\bauthoriz[e|ed]?\b/i, /\bapprove[d]?\b/i, /\bconfirm\b/i, /\bgo\s+ahead\b/i
  ];
  const QUESTION_PATTERNS = [
    /\?\s*$/, /^(qual|quais|como|quando|onde|por\s*que|quanto)\b/i,
    /^(what|how|when|where|why|which)\b/i
  ];
  const CHANNEL_KEYWORDS = ["discord", "telegram", "email", "e-mail", "twitter", "linkedin", "test", "teste"];
  const CURRENCY_PATTERN = /r\$\s?\d+(?:[.,]\d+)?|\$\s?\d+(?:[.,]\d+)?/gi;
  const QUOTED_PATTERN = /["“]([^"”]+)["”]/g;

  function normalize(rawText) {
    const raw = typeof rawText === "string" ? rawText : "";
    const trimmed = raw.trim().replace(/\s+/g, " ");
    return { raw, normalized: trimmed, normalized_lower: trimmed.toLowerCase(), is_empty: trimmed.length === 0 };
  }

  function classifyIntent(normalized) {
    if (normalized.is_empty) return { intent_type: "EMPTY", confidence: "high", matched_patterns: [] };
    const text = normalized.normalized_lower;
    const matched = [];
    for (const p of AUTHORIZATION_PATTERNS) if (p.test(text)) matched.push(String(p));
    if (matched.length) return { intent_type: "AUTHORIZATION_LANGUAGE", confidence: "medium", matched_patterns: matched };
    for (const p of COMMAND_PATTERNS) if (p.test(text)) matched.push(String(p));
    if (matched.length) return { intent_type: "COMMAND_PROPOSAL", confidence: "medium", matched_patterns: matched };
    for (const p of QUESTION_PATTERNS) if (p.test(text)) matched.push(String(p));
    if (matched.length) return { intent_type: "QUESTION", confidence: "medium", matched_patterns: matched };
    return { intent_type: "DICTATION", confidence: "low", matched_patterns: [] };
  }

  function extractEntities(normalized) {
    const text = normalized.normalized_lower;
    const channels = CHANNEL_KEYWORDS.filter((c) => text.includes(c));
    const amounts = normalized.normalized.match(CURRENCY_PATTERN) || [];
    const quoted = [];
    let m;
    QUOTED_PATTERN.lastIndex = 0;
    while ((m = QUOTED_PATTERN.exec(normalized.normalized)) !== null) quoted.push(m[1]);
    return { channels, amounts, quoted };
  }

  function determineContext(uiState) {
    const s = uiState || {};
    return {
      has_content: !!s.hasContent,
      has_targets: !!s.hasTargets,
      authorization_checked: !!s.authorizationChecked,
      authorized_by_filled: !!s.authorizedByFilled,
      currently_listening: !!s.listening,
      currently_speaking: !!s.speaking
    };
  }

  function determineState(context) {
    if (!context.has_content) return "idle";
    if (!context.authorization_checked || !context.authorized_by_filled) return "awaiting_authorization";
    return "ready_not_executed";
  }

  function decisionMatrix(intentClass) {
    switch (intentClass.intent_type) {
      case "EMPTY": return { action: "NONE", requires_human_authorization: null, rationale: "Nada foi dito." };
      case "AUTHORIZATION_LANGUAGE": return { action: "FILL_CONTENT_ONLY", requires_human_authorization: true, rationale: "A fala contém linguagem de autorização, mas voz nunca concede autorização neste sistema. É necessário marcar a caixa de autorização e preencher o campo de autorizador explicitamente." };
      case "COMMAND_PROPOSAL": return { action: "FILL_CONTENT_ONLY", requires_human_authorization: true, rationale: "A fala propõe uma ação de distribuição. O texto é tratado como proposta; distribuição real exige autorização explícita e envio." };
      case "QUESTION": return { action: "FILL_CONTENT_ONLY", requires_human_authorization: null, rationale: "Pergunta detectada. Este microfone dita texto; não há resposta conversacional nesta superfície." };
      default: return { action: "FILL_CONTENT_ONLY", requires_human_authorization: null, rationale: "Ditado simples — o texto foi transcrito para revisão." };
    }
  }

  function buildResponseMatrix(input) {
    const normalized = normalize(input.rawText);
    const intentClass = classifyIntent(normalized);
    const entities = extractEntities(normalized);
    const context = determineContext(input.uiState);
    const state = determineState(context);
    const decision = decisionMatrix(intentClass);
    return {
      matrix_version: "1.0",
      surface: "spiral-distribution-engine.voice",
      timestamp: new Date().toISOString(),
      asked: { raw_text: normalized.raw, lang: (input.uiState && input.uiState.lang) || "pt-BR" },
      understood: { intent_type: intentClass.intent_type, confidence: intentClass.confidence, entities },
      authorized: { status: "NOT_REQUESTED_BY_VOICE", note: "Voz nunca concede autorização. Apenas o formulário explícito autoriza." },
      executed: { status: "NOT_ATTEMPTED", detail: decision.action },
      observed: { status: "NONE" },
      provable: { status: "NONE" },
      next_action: { requires_human: decision.requires_human_authorization, label: decision.rationale },
      state
    };
  }

  const api = { normalize, classifyIntent, extractEntities, determineContext, determineState, decisionMatrix, buildResponseMatrix };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.SpiralVoicePipeline = api;
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : null));
