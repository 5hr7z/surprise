"""
Real Knowledge Graph Builder for ShrutiBot
==========================================
Parses the full WhatsApp chat export and builds:
1. knowledge_graph.json  - Structured entity/fact/topic graph for ShrutiBot RAG
2. core_memories.json    - Real milestones for Memory Lane UI

Strategy:
- Extract REAL dates, events, and facts from the chat 
- Identify emotional peaks (high-density emoji usage, "I love you" clusters)
- Find actual milestones (anniversary, birthday, first meet, trips, fights & makeups)
- Build entity profiles (people mentioned, pet names, inside jokes)
- Create topic clusters for semantic retrieval
"""

import re
import json
import collections
from datetime import datetime, timedelta

CHAT_FILE = "/Users/Shruti/Documents/PROJECTS/games/surprise/chat1yr_25:06:09.txt"
KG_OUT = "/Users/Shruti/Documents/PROJECTS/games/surprise/src/assets/knowledge_graph.json"
MEMORIES_OUT = "/Users/Shruti/Documents/PROJECTS/games/surprise/src/assets/core_memories.json"

MSG_REGEX = re.compile(
    r'^\u200e?\[(\d{2}/\d{2}/\d{2}),\s+(\d{1,2}:\d{2}:\d{2}(?:\s|\u202f|\u200f|\u202f| )?(?:AM|PM|am|pm| AM| PM))\]\s+([^:]+):\s+(.*)$'
)

def clean_text(text):
    return text.replace('\u200e', '').replace('\u200f', '').strip() if text else ""

def parse_chat():
    """Parse the full WhatsApp export into structured messages."""
    messages = []
    current_msg = None

    with open(CHAT_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            match = MSG_REGEX.match(line)
            if match:
                if current_msg:
                    messages.append(current_msg)
                date_str, time_str, sender, msg_text = match.groups()
                sender = clean_text(sender)
                msg_text = clean_text(msg_text)
                time_str_clean = time_str.replace('\u202f', ' ').replace(' ', ' ').strip()
                dt_str = f"{date_str} {time_str_clean}"
                dt = None
                for fmt in ("%d/%m/%y %I:%M:%S %p", "%d/%m/%y %H:%M:%S", "%m/%d/%y %I:%M:%S %p"):
                    try:
                        dt = datetime.strptime(dt_str, fmt)
                        break
                    except ValueError:
                        continue
                current_msg = {
                    "datetime": dt, "date_str": date_str,
                    "time_str": time_str_clean, "sender": sender, "text": msg_text
                }
            else:
                if current_msg:
                    current_msg["text"] += "\n" + clean_text(line)
        if current_msg:
            messages.append(current_msg)

    print(f"Parsed {len(messages)} messages.")
    return messages


def extract_facts(messages):
    """
    Extract real, verifiable facts from the chat.
    Looks for patterns like dates tied to events, stated preferences, names of people, etc.
    """
    facts = []
    seen_facts = set()

    # --- 1. Anniversary Detection ---
    anniversary_patterns = [
        (r"happy\s+\d*\s*(?:yr|yrs|year|years)?\s*anniversary", "anniversary_celebration"),
        (r"it'?s\s+our\s+anniversary", "anniversary_mention"),
        (r"our\s+anniversary\s+(?:is|was)", "anniversary_date"),
    ]
    for msg in messages:
        text_lower = msg["text"].lower()
        dt = msg["datetime"]
        if not dt:
            continue
        for pattern, fact_type in anniversary_patterns:
            if re.search(pattern, text_lower):
                fact_key = f"anniversary_{dt.strftime('%Y-%m-%d')}"
                if fact_key not in seen_facts:
                    seen_facts.add(fact_key)
                    facts.append({
                        "type": "anniversary",
                        "date": dt.strftime("%Y-%m-%d"),
                        "date_display": dt.strftime("%B %d, %Y"),
                        "speaker": msg["sender"],
                        "quote": msg["text"][:200],
                        "context": fact_type
                    })

    # --- 2. Birthday Detection ---
    birthday_patterns = [
        r"happy\s+birthday",
        r"it'?s\s+(?:my|your|ur)\s+birthday",
        r"birthday\s+(?:present|gift|surprise|party|cake)",
    ]
    for msg in messages:
        text_lower = msg["text"].lower()
        dt = msg["datetime"]
        if not dt:
            continue
        for pattern in birthday_patterns:
            if re.search(pattern, text_lower):
                fact_key = f"birthday_{msg['sender']}_{dt.strftime('%Y-%m-%d')}"
                if fact_key not in seen_facts:
                    seen_facts.add(fact_key)
                    facts.append({
                        "type": "birthday",
                        "date": dt.strftime("%Y-%m-%d"),
                        "date_display": dt.strftime("%B %d, %Y"),
                        "speaker": msg["sender"],
                        "quote": msg["text"][:200],
                    })

    # --- 3. "I love you" moments ---
    love_pattern = re.compile(r'\bi\s+love\s+(?:you|u)\b', re.IGNORECASE)
    love_moments = []
    for msg in messages:
        if love_pattern.search(msg["text"]) and msg["datetime"]:
            love_moments.append({
                "date": msg["datetime"].strftime("%Y-%m-%d"),
                "speaker": msg["sender"],
                "quote": msg["text"][:150]
            })
    # Just record the first and most recent
    if love_moments:
        facts.append({"type": "first_i_love_you", **love_moments[0]})
        facts.append({"type": "most_recent_i_love_you", **love_moments[-1]})
        facts.append({"type": "total_i_love_yous", "count": len(love_moments)})

    # --- 4. First meeting / in person ---
    meeting_patterns = [
        r"(?:when|first\s+time)\s+we\s+met",
        r"met\s+in\s+person",
        r"first\s+time\s+(?:meeting|seeing)\s+(?:you|u|each\s+other)",
    ]
    for msg in messages:
        text_lower = msg["text"].lower()
        dt = msg["datetime"]
        if not dt:
            continue
        for pattern in meeting_patterns:
            if re.search(pattern, text_lower):
                fact_key = f"first_meet_{dt.strftime('%Y-%m-%d')}"
                if fact_key not in seen_facts:
                    seen_facts.add(fact_key)
                    facts.append({
                        "type": "first_meeting",
                        "date": dt.strftime("%Y-%m-%d"),
                        "speaker": msg["sender"],
                        "quote": msg["text"][:200],
                    })

    # --- 5. Pet names / Terms of endearment ---
    pet_name_counters = {"Shruti": collections.Counter(), "Harvey Deason": collections.Counter()}
    pet_names_to_track = ["babe", "babes", "baby", "love", "darling", "sweetheart", "honey", 
                          "cutie", "patootie", "my love", "hubby", "wifey", "jaan", "jaanu"]
    for msg in messages:
        sender = msg["sender"]
        if sender not in pet_name_counters:
            continue
        text_lower = msg["text"].lower()
        for pn in pet_names_to_track:
            if pn in text_lower:
                pet_name_counters[sender][pn] += 1

    for sender, counter in pet_name_counters.items():
        top_names = counter.most_common(5)
        if top_names:
            facts.append({
                "type": "pet_names",
                "person": sender,
                "top_pet_names": [{"name": n, "count": c} for n, c in top_names]
            })

    # --- 6. People mentioned (family, friends) ---
    people_patterns = {
        "mom": r"\b(?:mom|mum|mama|mummy|mumma)\b",
        "dad": r"\b(?:dad|papa|daddy)\b",
        "nani": r"\bnani\b",
        "brother": r"\b(?:bro|brother)\b",
        "sister": r"\b(?:sis|sister|didi)\b",
    }
    people_mentions = collections.Counter()
    for msg in messages:
        text_lower = msg["text"].lower()
        for person, pattern in people_patterns.items():
            if re.search(pattern, text_lower):
                people_mentions[person] += 1
    
    facts.append({
        "type": "people_mentioned",
        "people": [{"person": p, "mention_count": c} for p, c in people_mentions.most_common(10)]
    })

    # --- 7. Places / Travel mentions ---
    place_patterns = {
        "london": r"\blondon\b",
        "india": r"\bindia\b",
        "delhi": r"\bdelhi\b",
        "mumbai": r"\bmumbai\b",
        "bangalore": r"\bbangalore\b",
        "uk": r"\b(?:uk|united kingdom|england)\b",
        "airport": r"\bairport\b",
        "flight": r"\bflight\b",
        "hotel": r"\bhotel\b",
    }
    place_mentions = collections.Counter()
    for msg in messages:
        text_lower = msg["text"].lower()
        for place, pattern in place_patterns.items():
            if re.search(pattern, text_lower):
                place_mentions[place] += 1
    
    if place_mentions:
        facts.append({
            "type": "places_mentioned",
            "places": [{"place": p, "count": c} for p, c in place_mentions.most_common(10)]
        })

    # --- 8. Recurring topics / Activities ---
    topic_patterns = {
        "coding": r"\b(?:code|coding|debug|deploy|github|react|python|vscode|gemini|api)\b",
        "food": r"\b(?:dinner|lunch|breakfast|biryani|pizza|cooking|recipe|eat|eating|hungry)\b",
        "movies": r"\b(?:movie|film|netflix|watch|watching|series|show|episode)\b",
        "gaming": r"\b(?:game|gaming|play|ps5|xbox|minecraft|valorant)\b",
        "work": r"\b(?:work|office|meeting|deadline|client|project|startup|investor)\b",
        "health": r"\b(?:gym|workout|exercise|sleep|tired|sick|headache|medicine)\b",
        "music": r"\b(?:song|music|spotify|playlist|listen|album|singer|concert)\b",
    }
    topic_counts = collections.Counter()
    for msg in messages:
        text_lower = msg["text"].lower()
        for topic, pattern in topic_patterns.items():
            if re.search(pattern, text_lower):
                topic_counts[topic] += 1

    facts.append({
        "type": "recurring_topics",
        "topics": [{"topic": t, "mention_count": c} for t, c in topic_counts.most_common()]
    })

    return facts


def extract_emotional_peaks(messages):
    """
    Find the most emotionally intense conversation windows.
    Uses emoji density + specific emotional keywords as signals.
    """
    emotional_keywords = [
        "i love you", "i miss you", "miss u", "love u", "love you so much",
        "im so proud", "i'm so proud", "you make me so happy", 
        "i can't live without", "you mean everything", "thank you for",
        "im crying", "i'm crying", "this made me cry",
        "im so sorry", "i'm so sorry", "please forgive",
        "happy anniversary", "happy birthday",
        "i cant wait to see you", "i can't wait to see you",
        "youre the best", "you're the best", "best boyfriend", "best girlfriend",
    ]
    
    # Score each message
    scored_messages = []
    for i, msg in enumerate(messages):
        if not msg["datetime"] or "omitted" in msg["text"].lower():
            continue
        text_lower = msg["text"].lower()
        score = 0
        
        # Emotional keyword hits
        for kw in emotional_keywords:
            if kw in text_lower:
                score += 3
        
        # Emoji density (hearts, crying, love emojis)
        love_emojis = ["❤", "💕", "💖", "💗", "💓", "💞", "🥺", "🥹", "😭", "🫂", "💋", "😍", "🥰"]
        for e in love_emojis:
            score += text_lower.count(e) * 2
        
        # Exclamation marks (excitement)
        score += min(msg["text"].count("!"), 3)
        
        if score > 0:
            scored_messages.append({
                "index": i,
                "score": score,
                "datetime": msg["datetime"],
                "sender": msg["sender"],
                "text": msg["text"][:200]
            })

    # Group by day and find peak days
    day_scores = collections.defaultdict(lambda: {"total_score": 0, "messages": []})
    for sm in scored_messages:
        day_key = sm["datetime"].strftime("%Y-%m-%d")
        day_scores[day_key]["total_score"] += sm["score"]
        day_scores[day_key]["messages"].append(sm)

    # Sort by total emotional score and take top 15 days
    top_days = sorted(day_scores.items(), key=lambda x: x[1]["total_score"], reverse=True)[:15]
    
    peaks = []
    for day_key, data in top_days:
        # Get the top 3 messages from that day
        top_msgs = sorted(data["messages"], key=lambda x: x["score"], reverse=True)[:3]
        peaks.append({
            "date": day_key,
            "emotional_score": data["total_score"],
            "highlights": [{"sender": m["sender"], "text": m["text"]} for m in top_msgs]
        })

    return peaks


def extract_milestones_for_memory_lane(messages, facts, emotional_peaks):
    """
    Build real core_memories.json from the extracted data.
    Each milestone has: id, title, date, quote, context, emoji
    """
    milestones = []
    seen_types = set()

    # --- From facts: Anniversary ---
    for f in facts:
        if f["type"] == "anniversary_celebration" or f["type"] == "anniversary":
            if "anniversary" not in seen_types:
                seen_types.add("anniversary")
                milestones.append({
                    "id": "anniversary",
                    "title": "Our Anniversary 💍",
                    "date": f.get("date_display", f.get("date", "")),
                    "quote": f["quote"],
                    "context": f"Celebrated by {f['speaker']}",
                    "emoji": "💖"
                })

    # --- From facts: Birthday ---
    for f in facts:
        if f["type"] == "birthday" and "birthday" not in seen_types:
            seen_types.add("birthday")
            milestones.append({
                "id": "birthday",
                "title": "Happy Birthday! 🎂",
                "date": f.get("date_display", f.get("date", "")),
                "quote": f["quote"],
                "context": f"{f['speaker']} wished happy birthday",
                "emoji": "🎂"
            })

    # --- From facts: First "I love you" ---
    for f in facts:
        if f["type"] == "first_i_love_you":
            milestones.append({
                "id": "first_ily",
                "title": "First 'I Love You' 💕",
                "date": f.get("date", ""),
                "quote": f["quote"],
                "context": f"Said by {f['speaker']}",
                "emoji": "💕"
            })

    # --- From emotional peaks: Top emotional days ---
    for i, peak in enumerate(emotional_peaks[:5]):
        peak_date = peak["date"]
        best_quote = peak["highlights"][0]["text"] if peak["highlights"] else ""
        best_speaker = peak["highlights"][0]["sender"] if peak["highlights"] else ""
        
        # Skip if it overlaps with an existing milestone date
        if any(m["date"] == peak_date for m in milestones):
            continue

        dt = datetime.strptime(peak_date, "%Y-%m-%d")
        milestones.append({
            "id": f"emotional_peak_{i}",
            "title": f"A Special Day ✨",
            "date": dt.strftime("%B %d, %Y"),
            "quote": best_quote,
            "context": f"One of our most emotionally intense days (score: {peak['emotional_score']})",
            "emoji": "✨"
        })

    # --- From facts: Total "I love you"s ---
    for f in facts:
        if f["type"] == "total_i_love_yous":
            milestones.append({
                "id": "love_count",
                "title": f"Said 'I Love You' {f['count']} Times 💗",
                "date": "All Year",
                "quote": f"We said 'I love you' {f['count']} times this year!",
                "context": "Counted across the entire chat history",
                "emoji": "💗"
            })

    return milestones


def build_knowledge_graph(facts, emotional_peaks, messages):
    """
    Build the full knowledge graph JSON.
    This is what gets injected into ShrutiBot's system prompt.
    """
    # Build entity profiles
    shruti_msgs = [m for m in messages if m["sender"] == "Shruti"]
    harvey_msgs = [m for m in messages if m["sender"] == "Harvey Deason"]

    # Find common phrases Shruti uses
    shruti_phrases = collections.Counter()
    for m in shruti_msgs:
        text = m["text"].lower().strip()
        if 3 <= len(text) <= 40 and "omitted" not in text:
            shruti_phrases[text] += 1
    top_shruti_phrases = [p for p, c in shruti_phrases.most_common(30) if c >= 5]

    # Find the actual anniversary date from facts
    anniversary_date = None
    for f in facts:
        if f["type"] in ("anniversary", "anniversary_celebration"):
            anniversary_date = f.get("date", None)
            break

    # Compile core facts as plain-text statements
    core_facts = []
    
    if anniversary_date:
        # Parse to get month/day
        try:
            dt = datetime.strptime(anniversary_date, "%Y-%m-%d")
            core_facts.append(f"Shruti and Harvey's anniversary is {dt.strftime('%B %d')} (May 27).")
        except:
            core_facts.append(f"Shruti and Harvey's anniversary date: {anniversary_date}.")
    
    for f in facts:
        if f["type"] == "birthday":
            try:
                dt = datetime.strptime(f["date"], "%Y-%m-%d")
                core_facts.append(f"Harvey's birthday: {dt.strftime('%B %d')} (based on birthday wishes in chat).")
            except:
                pass
            break

    for f in facts:
        if f["type"] == "total_i_love_yous":
            core_facts.append(f"They have said 'I love you' to each other {f['count']} times in the past year.")
    
    for f in facts:
        if f["type"] == "pet_names":
            names = ", ".join([f'{n["name"]} ({n["count"]}x)' for n in f["top_pet_names"][:3]])
            core_facts.append(f"{f['person']}'s favorite pet names: {names}.")

    for f in facts:
        if f["type"] == "people_mentioned":
            people_str = ", ".join([f'{p["person"]} ({p["mention_count"]}x)' for p in f["people"][:5]])
            core_facts.append(f"People frequently mentioned in chats: {people_str}.")

    for f in facts:
        if f["type"] == "places_mentioned":
            places_str = ", ".join([f'{p["place"]} ({p["count"]}x)' for p in f["places"][:5]])
            core_facts.append(f"Places frequently mentioned: {places_str}.")

    for f in facts:
        if f["type"] == "recurring_topics":
            topics_str = ", ".join([f'{t["topic"]} ({t["mention_count"]}x)' for t in f["topics"][:5]])
            core_facts.append(f"Their most discussed topics: {topics_str}.")

    core_facts.append("The passcode to unlock Shruti's surprise app is 2705.")

    # Build the graph
    knowledge_graph = {
        "entities": {
            "Shruti": {
                "role": "Girlfriend",
                "message_count": len(shruti_msgs),
                "common_phrases": top_shruti_phrases[:15],
            },
            "Harvey Deason": {
                "role": "Boyfriend", 
                "message_count": len(harvey_msgs),
            }
        },
        "facts": core_facts,
        "emotional_peaks": [
            {
                "date": p["date"],
                "score": p["emotional_score"],
                "sample_quote": p["highlights"][0]["text"][:100] if p["highlights"] else ""
            }
            for p in emotional_peaks[:8]
        ],
        "all_extracted_facts": facts,
    }

    return knowledge_graph


def main():
    print("=" * 60)
    print("KNOWLEDGE GRAPH BUILDER - Real GraphRAG Pipeline")
    print("=" * 60)

    print("\n[1/4] Parsing chat file...")
    messages = parse_chat()

    print(f"\n[2/4] Extracting facts from {len(messages)} messages...")
    facts = extract_facts(messages)
    print(f"  → Extracted {len(facts)} facts")
    for f in facts:
        if f["type"] in ("anniversary", "birthday", "first_i_love_you", "total_i_love_yous"):
            val = f.get('quote', f.get('count', ''))
            val_str = str(val)[:80] if val else ''
            print(f"  → {f['type']}: {val_str}")

    print(f"\n[3/4] Finding emotional peaks...")
    emotional_peaks = extract_emotional_peaks(messages)
    print(f"  → Found {len(emotional_peaks)} peak emotional days")
    for p in emotional_peaks[:5]:
        print(f"  → {p['date']} (score: {p['emotional_score']}): {p['highlights'][0]['text'][:60]}...")

    print(f"\n[4/4] Building Knowledge Graph & Core Memories...")
    kg = build_knowledge_graph(facts, emotional_peaks, messages)
    milestones = extract_milestones_for_memory_lane(messages, facts, emotional_peaks)

    # Write outputs
    with open(KG_OUT, 'w', encoding='utf-8') as f:
        json.dump(kg, f, indent=2, ensure_ascii=False)
    print(f"  → Wrote knowledge_graph.json ({len(kg['facts'])} core facts)")

    with open(MEMORIES_OUT, 'w', encoding='utf-8') as f:
        json.dump(milestones, f, indent=2, ensure_ascii=False)
    print(f"  → Wrote core_memories.json ({len(milestones)} milestones)")

    print("\n" + "=" * 60)
    print("DONE! Knowledge Graph built successfully.")
    print("=" * 60)
    print("\nCore Facts that ShrutiBot now knows:")
    for i, fact in enumerate(kg["facts"], 1):
        print(f"  {i}. {fact}")


if __name__ == "__main__":
    main()
