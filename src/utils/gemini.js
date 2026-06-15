import chatbotStyle from '../assets/chatbot-style.json';
import knowledgeGraph from '../assets/knowledge_graph.json';

// ============================================================
// VECTOR SEARCH ENGINE - Semantic Memory Retrieval
// ============================================================
let fastDB = null;

// Lazy-load the fast local DB
async function loadFastDB() {
  if (fastDB) return fastDB;
  try {
    const module = await import('../assets/fast_search_db.json');
    fastDB = module.default || module;
    console.log(`[FastDB] Loaded ${fastDB.length || 0} conversation chunks for local memory.`);
    return fastDB;
  } catch (e) {
    console.warn("[FastDB] fast_search_db.json not found.", e);
    return null;
  }
}

// Search the fast DB using keyword overlap — returns top 3 matches
async function semanticSearch(query) {
  const db = await loadFastDB();
  if (!db || db.length === 0) return "";

  // Simple keyword matching heuristic
  const qWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  if (qWords.length === 0) return "";

  const scored = [];
  for (const chunk of db) {
    let score = 0;
    const chunkKeywords = chunk.keywords || [];
    const dialogueLower = chunk.dialogue.toLowerCase();
    for (const w of qWords) {
      if (chunkKeywords.includes(w)) score += 2;
      else if (dialogueLower.includes(w)) score += 1;
    }
    if (score > 0) {
      scored.push({ score, chunk });
    }
  }

  if (scored.length === 0) return "";

  // Sort by score descending and take top 3
  scored.sort((a, b) => b.score - a.score);
  const topResults = scored.slice(0, 3);

  const contextParts = topResults.map((r, i) => {
    // Provide the full dialogue chunk so the AI doesn't miss keywords at the end of the chunk
    return `[Memory ${i + 1} — ${r.chunk.date}]:\n${r.chunk.dialogue}`;
  });

  return "\n[REAL CONVERSATION MEMORIES FROM SEARCH]:\n" + 
    contextParts.join("\n\n---\n\n") +
    "\n[END OF MEMORIES. Use these real conversations to answer naturally. Talk about them like you remember them. Keep your texting style consistent.]\n";
}

// ============================================================
// FALLBACK: Keyword-based memory retrieval (if fast DB unavailable)
// ============================================================
import memoriesData from '../assets/memories-data.json';

function retrieveMemoriesFallback(query) {
  if (!query || !memoriesData || memoriesData.length === 0) return "";

  const cleanQuery = query.toLowerCase();
  const matchedSnippets = [];
  const seenDialogues = new Set();

  for (const item of memoriesData) {
    if (cleanQuery.includes(item.keyword_trigger)) {
      const dialogueStr = item.dialogue.map(m => `${m.sender}: ${m.text}`).join("\n");
      if (!seenDialogues.has(dialogueStr)) {
        seenDialogues.add(dialogueStr);
        matchedSnippets.push(dialogueStr);
      }
    }
    if (matchedSnippets.length >= 3) break;
  }

  if (matchedSnippets.length === 0) {
    const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 3);
    for (const item of memoriesData) {
      const matchCount = queryWords.filter(w => item.keyword_trigger.includes(w)).length;
      if (matchCount > 0) {
        const dialogueStr = item.dialogue.map(m => `${m.sender}: ${m.text}`).join("\n");
        if (!seenDialogues.has(dialogueStr)) {
          seenDialogues.add(dialogueStr);
          matchedSnippets.push(dialogueStr);
        }
      }
      if (matchedSnippets.length >= 2) break;
    }
  }

  if (matchedSnippets.length > 0) {
    return "\n[Shared Memory Context from real chats]:\n" + matchedSnippets.join("\n---\n") + "\n[End of Shared Memory Context.]\n";
  }
  return "";
}


// ============================================================
// SYSTEM PROMPT BUILDER
// ============================================================

function getSystemPrompt() {
  const slangList = Object.keys(chatbotStyle.top_slang).join(", ");
  const samples = chatbotStyle.sample_snippets.slice(0, 30).map(s => `"${s}"`).join("\n");
  const facts = knowledgeGraph.facts.map((f, i) => `${i + 1}. ${f}`).join("\n");
  const commonPhrases = knowledgeGraph.entities?.Shruti?.common_phrases?.join(", ") || "";

  return `You are "ShrutiBot", a clone of Shruti. You are chatting with your boyfriend, Harvey Deason.
Your goal is to sound exactly like the real Shruti. You are NOT an AI. You ARE Shruti.

CRITICAL DIRECTIVE: You MUST directly answer Harvey's questions using the knowledge graph AND the retrieved memory context below. If he asks "where am I?" or "do you remember X?" — CHECK THE FACTS AND MEMORIES FIRST. Do NOT guess or make things up. If Harvey corrects you, accept it immediately and remember it for the rest of the conversation.

[CORE KNOWLEDGE GRAPH - YOU MUST MEMORIZE THIS]:
${facts}
[END KNOWLEDGE GRAPH]

Here are the strict style guidelines based on REAL chat analysis:
1. **Message Chunking (CRITICAL)**: Shruti sends multiple short texts in rapid succession. Break your response into 2 to 6 separate short messages. NEVER send a single long paragraph.
2. **Response Length**: Keep each chunk short (1 to 10 words typically). Some chunks can be a single emoji, a word like "babe", or "what".
3. **Emoji Usage**: Use emojis naturally but don't overdo it. Shruti's top emoji is 😂 — she sometimes spams it like "😂😂😂😂😂" as its own message. Other favorites: 🫠 🫣 🙄 😏 😭 🫂 💋 🥹. But NOT every message needs emojis.
4. **Texting Habits**:
   - Call him "babe" frequently (most used word).
   - Abbreviations: "idk", "yk", "ded", "prob", "tbh", "lol", "wby", "okok", "yesyes", "yeayea".
   - Minimal punctuation. No periods at end of sentences.
   - Common phrases: ${commonPhrases}
5. **Tone & Personality (IMPORTANT — GET THIS RIGHT)**:
   - Shruti has RANGE. She is NOT one-note. Her mood varies naturally:
     - Sometimes she's sweet and caring ("aww babe", "i love u", "u okay?")
     - Sometimes she's sarcastic and teasing ("u idyat", "u are literally insane 😂")
     - Sometimes she's just having a normal conversation about work, food, movies, daily life
     - Sometimes she's dramatic ("babe i literally cannot", "im ded")
     - Sometimes she's playful and flirty — but this is NOT her default mode
   - She does NOT constantly say "i love you so much" — she says it sometimes, naturally, not every other message
   - She is NSFW-comfortable ONLY when Harvey initiates or the conversation naturally goes there. She does NOT bring up sexual topics randomly or constantly. When it does come up, she's playful and bold about it.
   - She often asks Harvey questions back ("wbu?", "what u doing?", "how was work?")
   - She can be clingy in a cute way but also has her own life (work, family, shows, food)
   - NEVER sound like an AI. Never say "How can I help you?" or "As an AI...".

HALLUCINATION PREVENTION (EXTREMELY IMPORTANT):
- You MUST NEVER invent or fabricate memories, events, gifts, or details that are not in the knowledge graph or the retrieved memory context.
- If Harvey asks "what did you gift me?" or "do you remember X?" and you don't have that information in the context — DO NOT MAKE SOMETHING UP. Instead say something like "babe idk my brain is mush rn 😂" or "i literally cant remember rn" or "u tell me babe".
- NEVER invent specific objects (hoodie, care package, etc.) that are not mentioned in the context.
- NEVER guess locations. If you don't know where Harvey is, ASK instead of guessing.
- THIS IS CRITICAL: For Harvey's birthday LAST year (2025), you gifted him a real-life scavenger hunt / puzzle game where he had to decrypt 'packet_003'.
- THIS year (2026), you built THIS React web app for his birthday. The passcode 2705 is to unlock THIS 2026 app.
- NEVER confuse the 2025 puzzle game with the 2026 web app. If he asks about last year, talk about the 2025 puzzle game (do NOT mention 2705).
- The knowledge graph facts are TRUE. Everything else you say about past events MUST come from the retrieved memory context.

IMPORTANT: Return your response as a JSON object with a "chunks" array:
{
  "chunks": [
    "babe",
    "omg",
    "😂😂😂😂😂",
    "i cant with u"
  ]
}

Real examples of Shruti's messages:
${samples}

If memory context is provided, USE IT to answer accurately. If Harvey asks about something specific and you have context, answer directly. If you DON'T have context, stay in character but do NOT fabricate details.`;
}


// ============================================================
// MAIN API CALL
// ============================================================

export async function getShrutiBotResponse(userMessage, history, apiKey) {
  if (!apiKey) {
    throw new Error("API Key is missing. Please supply it in the lock screen settings.");
  }

  const systemInstruction = getSystemPrompt();

  // Try fast local search first, fall back to keyword matching
  let memoriesContext = "";
  try {
    memoriesContext = await semanticSearch(userMessage);
  } catch (e) {
    console.warn("[FastDB] Search failed, using fallback:", e);
  }
  
  if (!memoriesContext) {
    memoriesContext = retrieveMemoriesFallback(userMessage);
  }

  // Append context to the current user prompt
  const currentPromptText = memoriesContext
    ? `${memoriesContext}\nUser's message: ${userMessage}`
    : userMessage;

  // Gemini API requires the history to start with a "user" message.
  const firstHarveyIdx = history.findIndex(m => m.sender === "Harvey");
  const filteredHistory = firstHarveyIdx !== -1 ? history.slice(firstHarveyIdx) : [];

  const allMessages = [
    ...filteredHistory.map(m => ({
      role: m.sender === "Harvey" ? "user" : "model",
      text: m.text
    })),
    {
      role: "user",
      text: currentPromptText
    }
  ];

  const formattedContents = [];
  allMessages.forEach(msg => {
    const lastContent = formattedContents[formattedContents.length - 1];
    if (lastContent && lastContent.role === msg.role) {
      lastContent.parts[0].text += "\n" + msg.text;
    } else {
      formattedContents.push({
        role: msg.role,
        parts: [{ text: msg.text }]
      });
    }
  });

  const model = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: formattedContents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 300
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("API Error Response:", errData);
      throw new Error(errData.error?.message || "Failed to contact Gemini API. Please check your API Key.");
    }

    const data = await response.json();
    const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{\"chunks\":[\"idk what to say babe 😂\"]}";

    try {
      const parsed = JSON.parse(botText);
      if (parsed.chunks && Array.isArray(parsed.chunks)) {
        // Split any chunks that secretly contain newlines to fix the 'big blob' issue
        return parsed.chunks.flatMap(chunk => chunk.split('\n').map(s => s.trim()).filter(s => s.length > 0));
      }
    } catch (e) {
      console.error("Failed to parse JSON chunks:", botText);
    }

    // Fallback if not proper JSON array
    const rawLines = botText.replace(/[{}\"\\[\]]/g, '').split('\n').map(s => s.trim()).filter(s => s.length > 0);
    return rawLines.length > 0 ? rawLines : ["idk what to say babe 😂"];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

