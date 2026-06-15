import re
import json
import collections
from datetime import datetime

# File paths
CHAT_FILE = "/Users/Shruti/Documents/PROJECTS/games/surprise/chat1yr_25:06:09.txt"
STATS_OUT = "/Users/Shruti/Documents/PROJECTS/games/surprise/src/assets/stats-data.json"
MEMORIES_OUT = "/Users/Shruti/Documents/PROJECTS/games/surprise/src/assets/memories-data.json"
STYLE_OUT = "/Users/Shruti/Documents/PROJECTS/games/surprise/src/assets/chatbot-style.json"

# Regex to parse WhatsApp lines
MSG_REGEX = re.compile(r'^\u200e?\[(\d{2}/\d{2}/\d{2}),\s+(\d{1,2}:\d{2}:\d{2}(?:\s|\u202f|\u200f|\u202f| )?(?:AM|PM|am|pm| AM| PM))\]\s+([^:]+):\s+(.*)$')

def clean_text(text):
    if not text:
        return ""
    # Strip Left-to-Right Marks and other invisible characters
    return text.replace('\u200e', '').replace('\u200f', '').strip()

def is_emoji(char):
    cp = ord(char)
    # Exclude skin tone modifiers (1F3FB to 1F3FF)
    if 0x1F3FB <= cp <= 0x1F3FF:
        return False
    # Exclude variation selector-16 (FE0F)
    if cp == 0xFE0F:
        return False
    # Exclude zero width joiner (200D)
    if cp == 0x200D:
        return False
    # Exclude gender symbols (2640, 2642)
    if cp in (0x2640, 0x2642):
        return False
        
    # Common emoji ranges in Unicode
    return (
        (0x1F600 <= cp <= 0x1F64F) or  # Emoticons
        (0x1F300 <= cp <= 0x1F5FF) or  # Misc Symbols and Pictographs
        (0x1F680 <= cp <= 0x1F6FF) or  # Transport and Map Symbols
        (0x1F900 <= cp <= 0x1F9FF) or  # Supplemental Symbols and Pictographs
        (0x1FA70 <= cp <= 0x1FAFF) or  # Symbols & Pictographs Extended-A
        (0x2600 <= cp <= 0x27BF) or    # Dingbats & Misc Symbols
        (0x1F1E6 <= cp <= 0x1F1FF)     # Flags (regional indicators)
    )

def extract_emojis(text):
    return [c for c in text if is_emoji(c)]


def parse_chat():
    messages = []
    current_msg = None

    print("Reading chat file...")
    with open(CHAT_FILE, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            cleaned_line = line.replace('\u200e', '').replace('\u200f', '')
            match = MSG_REGEX.match(line)
            
            if match:
                if current_msg:
                    messages.append(current_msg)
                
                date_str, time_str, sender, msg_text = match.groups()
                sender = clean_text(sender)
                msg_text = clean_text(msg_text)
                
                # Parse date & time
                # Remove narrow non-breaking spaces or weird spaces
                time_str_clean = time_str.replace('\u202f', ' ').replace(' ', ' ').strip()
                dt_str = f"{date_str} {time_str_clean}"
                
                dt = None
                # Let's try parsing the timestamp
                for fmt in ("%d/%m/%y %I:%M:%S %p", "%d/%m/%y %H:%M:%S", "%m/%d/%y %I:%M:%S %p"):
                    try:
                        dt = datetime.strptime(dt_str, fmt)
                        break
                    except ValueError:
                        continue
                
                current_msg = {
                    "datetime": dt,
                    "date_str": date_str,
                    "time_str": time_str_clean,
                    "sender": sender,
                    "text": msg_text,
                    "line_num": line_num
                }
            else:
                # Continuation of previous message
                if current_msg:
                    current_msg["text"] += "\n" + clean_text(line)
                else:
                    # Ignore lines before the first message matches
                    pass

        if current_msg:
            messages.append(current_msg)

    print(f"Parsed {len(messages)} messages total.")
    return messages

def analyze_chats(messages):
    if not messages:
        print("No messages parsed!")
        return

    # User breakdown
    users = set(m["sender"] for m in messages)
    print("Senders found:", users)

    # Initialize statistics
    stats = {
        "total_messages": len(messages),
        "user_stats": {},
        "hourly_distribution": [0] * 24,
        "monthly_distribution": {},
        "initiator_stats": {s: 0 for s in users},
        "media_omitted_counts": {s: 0 for s in users}
    }

    for u in users:
        stats["user_stats"][u] = {
            "message_count": 0,
            "word_count": 0,
            "char_count": 0,
            "emojis": [],
            "average_message_length": 0,
        }

    # Tracking emoji frequencies
    user_emojis = {u: collections.Counter() for u in users}
    
    # Track conversation initiators (messages sent after 6 hours of silence)
    last_dt = None
    
    # Memory extraction
    # We will save key dialogue snippets that contain romantic/memorable words
    memories = []
    
    # Text style analysis for ShrutiBot
    shruti_style = {
        "capitalization_frequency": 0,  # Messages starting with uppercase
        "exclamation_count": 0,
        "question_count": 0,
        "slang_word_counts": collections.Counter(),
        "average_response_delay": [],
        "text_snippets": []
    }

    slang_words = ["babe", "babes", "patootie", "ded", "lol", "hahaha", "hell yeah", "crazy", "tbh", "yk", "idk", "idu", "prob"]

    for idx, msg in enumerate(messages):
        sender = msg["sender"]
        text = msg["text"]
        dt = msg["datetime"]

        # 1. Basic counts
        stats["user_stats"][sender]["message_count"] += 1
        stats["user_stats"][sender]["char_count"] += len(text)
        
        # Check for omitted media
        if "omitted" in text.lower():
            stats["media_omitted_counts"][sender] += 1
        
        words = text.split()
        stats["user_stats"][sender]["word_count"] += len(words)

        # 2. Hourly distribution
        if dt:
            stats["hourly_distribution"][dt.hour] += 1
            month_key = dt.strftime("%Y-%m")
            stats["monthly_distribution"][month_key] = stats["monthly_distribution"].get(month_key, 0) + 1

        # 3. Emoji distribution
        emojis = extract_emojis(text)
        user_emojis[sender].update(emojis)

        # 4. Conversation Initiators
        if dt and last_dt:
            time_gap = (dt - last_dt).total_seconds()
            if time_gap >= 6 * 3600:  # 6 hours
                stats["initiator_stats"][sender] += 1
        last_dt = dt

        # 5. Extracting Memories
        # Find messages that are highly memorable
        memory_keywords = ["love", "anniversary", "birthday", "happy", "miss", "favorite", "remember", "wedding", "meet", "cute", "funny", "forever", "promise", "kiss", "kisses", "eggo", "ego", "vent", "venting", "fart", "creases", "nipples", "asshole", "finger", "fist"]
        has_kw = any(kw in text.lower() for kw in memory_keywords)
        
        # We also want to capture local context around keywords
        if has_kw and len(text) > 10 and len(text) < 150:
            # Add dialogue segment (current, previous, and next message if same sender or conversation)
            snippet = []
            start_idx = max(0, idx - 1)
            end_idx = min(len(messages), idx + 2)
            for s_idx in range(start_idx, end_idx):
                m = messages[s_idx]
                snippet.append({
                    "sender": m["sender"],
                    "text": m["text"],
                    "time": m["time_str"],
                    "date": m["date_str"]
                })
            memories.append({
                "keyword_trigger": [kw for kw in memory_keywords if kw in text.lower()][0],
                "dialogue": snippet
            })

        # 6. Shruti Text Style Analysis
        if sender == "Shruti":
            # Track capitalization
            if text and text[0].isupper():
                shruti_style["capitalization_frequency"] += 1
            
            # Punctuation counts
            shruti_style["exclamation_count"] += text.count("!")
            shruti_style["question_count"] += text.count("?")

            # Slang frequencies
            text_lower = text.lower()
            for s in slang_words:
                if s in text_lower:
                    shruti_style["slang_word_counts"][s] += 1
            
            # Snippets for system prompt examples - include ALL types including NSFW and emoji spam
            if len(text) > 1 and len(text) < 80 and "omitted" not in text.lower():
                shruti_style["text_snippets"].append(text)

    # Average message length calculations
    for u in users:
        m_count = stats["user_stats"][u]["message_count"]
        w_count = stats["user_stats"][u]["word_count"]
        stats["user_stats"][u]["average_message_length"] = round(w_count / m_count, 1) if m_count > 0 else 0
        # Convert counter to sorted list
        stats["user_stats"][u]["top_emojis"] = [
            {"emoji": e, "count": c} for e, c in user_emojis[u].most_common(12)
        ]

    # Clean up stats format
    stats["total_initiations"] = sum(stats["initiator_stats"].values())
    
    # Shruti Style post-processing
    shruti_msg_count = stats["user_stats"].get("Shruti", {}).get("message_count", 1)
    shruti_style["capitalization_frequency"] = round(shruti_style["capitalization_frequency"] / shruti_msg_count, 2)
    shruti_style["exclamation_per_message"] = round(shruti_style["exclamation_count"] / shruti_msg_count, 2)
    shruti_style["question_per_message"] = round(shruti_style["question_count"] / shruti_msg_count, 2)
    shruti_style["top_slang"] = dict(shruti_style["slang_word_counts"].most_common(10))
    shruti_style["sample_snippets"] = list(set(shruti_style["text_snippets"]))[:200] # Unique 200 snippets
    del shruti_style["text_snippets"]
    del shruti_style["slang_word_counts"]

    # Limit memories size for client bundle
    # Sort memories or sample them
    print(f"Extracted {len(memories)} memory snippets.")
    unique_memories = []
    seen_dialogues = set()
    for mem in memories:
        dialogue_text = " // ".join(f"{m['sender']}: {m['text']}" for m in mem["dialogue"])
        if dialogue_text not in seen_dialogues:
            seen_dialogues.add(dialogue_text)
            unique_memories.append(mem)
    
    # Cap memories at 800 to keep JSON small
    unique_memories = unique_memories[:800]
    
    # Write to files
    print("Writing files...")
    import os
    os.makedirs(os.path.dirname(STATS_OUT), exist_ok=True)
    
    # Custom serializer to handle datetime objects
    def default_serializer(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")

    with open(STATS_OUT, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, default=default_serializer)
        
    with open(MEMORIES_OUT, 'w', encoding='utf-8') as f:
        json.dump(unique_memories, f, indent=2, default=default_serializer)
        
    with open(STYLE_OUT, 'w', encoding='utf-8') as f:
        json.dump(shruti_style, f, indent=2, default=default_serializer)
        
    # NOTE: core_memories.json is now managed by build_knowledge_graph.py
    # Do NOT overwrite it here.

    print("Success! Generated stats, memories, and style JSON.")


if __name__ == "__main__":
    msgs = parse_chat()
    analyze_chats(msgs)
