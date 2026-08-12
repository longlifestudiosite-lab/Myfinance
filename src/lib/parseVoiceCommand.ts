export interface ParsedTransaction {
  type: "expense" | "income";
  amount: number;
  description: string;
  category: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  alimentação: ["mercado", "supermercado", "restaurante", "lanche", "comida", "almoço", "jantar", "café", "padaria", "ifood", "delivery"],
  transporte: ["uber", "gasolina", "combustível", "ônibus", "metrô", "estacionamento", "pedágio", "99"],
  moradia: ["aluguel", "condomínio", "luz", "água", "internet", "gás", "iptu"],
  saúde: ["farmácia", "médico", "remédio", "consulta", "exame", "plano de saúde"],
  educação: ["curso", "livro", "escola", "faculdade", "mensalidade"],
  lazer: ["cinema", "netflix", "spotify", "jogo", "viagem", "bar", "festa"],
  vestuário: ["roupa", "calçado", "tênis", "camisa", "calça"],
  salário: ["salário", "pagamento", "freelance", "renda", "recebi"],
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return "outros";
}

function detectType(text: string): "expense" | "income" {
  const lower = text.toLowerCase().trim();

  // If starts with "entrada" -> income
  const incomeStarters = ["entrada", "recebi", "ganhei", "recebimento"];
  if (incomeStarters.some((kw) => lower.startsWith(kw))) {
    return "income";
  }

  // If starts with "saída" or "despesa" or "gastei" -> expense
  const expenseStarters = ["saída", "saida", "despesa", "gastei", "paguei", "comprei"];
  if (expenseStarters.some((kw) => lower.startsWith(kw))) {
    return "expense";
  }

  // Fallback: check anywhere in text
  const incomeKeywords = ["entrada", "recebi", "ganhei", "salário", "renda", "entrou", "depósito", "recebimento"];
  if (incomeKeywords.some((kw) => lower.includes(kw))) {
    return "income";
  }

  // Default: expense
  return "expense";
}

function extractAmount(text: string): number | null {
  const patterns = [
    /(\d+[.,]\d{2})/,
    /(\d+)\s*reais/i,
    /r\$\s*(\d+[.,]?\d*)/i,
    /(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(",", "."));
    }
  }
  return null;
}

function extractDescription(text: string): string {
  let desc = text
    .replace(/\d+[.,]?\d*\s*(reais|real)?/gi, "")
    .replace(/r\$/gi, "")
    // Remove type keywords from the description
    .replace(/\b(entrada|saída|saida|despesa|gastei|paguei|comprei|recebi|ganhei|recebimento)\b/gi, "")
    .replace(/\b(no|na|de|do|em|com|para|pelo|pela)\b/gi, " ")
    .trim();

  desc = desc.replace(/\s+/g, " ").trim();
  if (desc.length > 0) {
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
  }

  return desc || "Transação por voz";
}

export function parseVoiceCommand(text: string): ParsedTransaction | null {
  if (!text || text.trim().length === 0) return null;

  const amount = extractAmount(text);
  if (!amount || amount <= 0) return null;

  return {
    type: detectType(text),
    amount,
    description: extractDescription(text),
    category: detectCategory(text),
  };
}
