"""
Fast Local Memory Engine & Memory Lane Transcript Extractor
===========================================================
This script replaces the slow Gemini Vector DB. It processes 564k messages in seconds.
1. It builds a fast keyword search index for ShrutiBot (fast_search_db.json).
2. It extracts the raw chat transcripts for the dates used in Memory Lane (memory_lane_transcripts.json).
"""

import re
import json
from collections import Counter
from datetime import datetime

CHAT_FILE = "/Users/Shruti/Documents/PROJECTS/games/surprise/chat1yr_25:06:09.txt"
FAST_DB_OUTPUT = "/Users/Shruti/Documents/PROJECTS/games/surprise/src/assets/fast_search_db.json"
TRANSCRIPTS_OUTPUT = "/Users/Shruti/Documents/PROJECTS/games/surprise/src/assets/memory_lane_transcripts.json"

MSG_REGEX = re.compile(
    r'^\u200e?\[(\d{2}/\d{2}/\d{2}),\s+(\d{1,2}:\d{2}:\d{2}(?:\s|\u202f|\u200f|\u202f| )?(?:AM|PM|am|pm| AM| PM))\]\s+([^:]+):\s+(.*)$'
)

# Core Memory Dates we need transcripts for (format: YYYY-MM-DD)
TARGET_DATES = {
    "2026-05-27": "anniversary",
    "2025-06-15": "birthday_harvey",
    "2026-05-12": "birthday_shruti",
    "2025-06-09": "first_ily",
    "2025-07-23": "emotional_peak_jul23",
    "2025-06-17": "emotional_peak_jun17",
    "2025-07-07": "most_texted_month", # Picking a peak day in July
    "2025-08-11": "babe_counter", # A random day with lots of babes
    "2025-07-15": "love_count" # A random day with lots of love
}

# Stopwords to filter out when building keywords
STOPWORDS = set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", 
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", 
    "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", 
    "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", 
    "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", 
    "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", 
    "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", 
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", 
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", 
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", 
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", 
    "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
])

def clean_text(text):
    return text.replace('\u200e', '').replace('\u200f', '').strip() if text else ""

def get_keywords(text):
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    filtered = [w for w in words if w not in STOPWORDS]
    # Return top 15 most common meaningful words in this chunk
    return [w for w, _ in Counter(filtered).most_common(15)]

def main():
    print("Parsing 564k messages...")
    messages = []
    
    # 1. Parse everything into memory
    with open(CHAT_FILE, 'r', encoding='utf-8') as f:
        current_msg = None
        for line in f:
            match = MSG_REGEX.match(line)
            if match:
                if current_msg:
                    messages.append(current_msg)
                date_str, time_str, sender, msg_text = match.groups()
                sender = clean_text(sender)
                msg_text = clean_text(msg_text)
                
                dt_str = f"{date_str} {time_str.replace('\u202f', ' ').replace('\xa0', ' ').strip()}"
                dt = None
                for fmt in ("%d/%m/%y %I:%M:%S %p", "%d/%m/%y %H:%M:%S", "%m/%d/%y %I:%M:%S %p"):
                    try:
                        dt = datetime.strptime(dt_str, fmt)
                        break
                    except ValueError:
                        continue
                
                date_ymd = dt.strftime("%Y-%m-%d") if dt else "unknown"
                current_msg = {"dt": dt, "date_ymd": date_ymd, "sender": sender, "text": msg_text}
            else:
                if current_msg:
                    current_msg["text"] += "\n" + clean_text(line)
        if current_msg:
            messages.append(current_msg)

    print(f"Total messages parsed: {len(messages)}")

    # 2. Extract specific day transcripts for Memory Lane
    print("Extracting full transcripts for Memory Lane dates...")
    transcripts = {val: [] for val in TARGET_DATES.values()}
    
    # We want to extract a nice window of messages for those specific days (up to 300 messages)
    day_buffers = {val: [] for val in TARGET_DATES.values()}
    
    for msg in messages:
        ymd = msg["date_ymd"]
        if ymd in TARGET_DATES:
            mem_id = TARGET_DATES[ymd]
            day_buffers[mem_id].append({
                "sender": msg["sender"],
                "text": msg["text"],
                "time": msg["dt"].strftime("%I:%M %p") if msg["dt"] else ""
            })

    # Pick the most "dense" 100-message window for each target day to keep it readable
    for mem_id, msgs in day_buffers.items():
        if not msgs:
            continue
        # Find window with most text
        best_window = msgs
        if len(msgs) > 100:
            best_idx = 0
            max_len = 0
            for i in range(len(msgs) - 100):
                window_len = sum(len(m["text"]) for m in msgs[i:i+100])
                if window_len > max_len:
                    max_len = window_len
                    best_idx = i
            best_window = msgs[best_idx:best_idx+100]
        transcripts[mem_id] = best_window

    with open(TRANSCRIPTS_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(transcripts, f, ensure_ascii=False)
    print(f"Saved memory_lane_transcripts.json")

    # 3. Build Fast Local DB for ShrutiBot (Chunking)
    print("Building Fast Search Database for ShrutiBot...")
    chunks = []
    current_chunk = []
    last_dt = None

    for msg in messages:
        dt = msg["dt"]
        if not dt: continue
        
        if last_dt and (dt - last_dt).total_seconds() > 3600: # 1 hour gap = new chunk
            if len(current_chunk) >= 10:
                chunks.append(current_chunk)
            current_chunk = []
            
        current_chunk.append(msg)
        if len(current_chunk) >= 150: # Max 150 msgs per chunk
            chunks.append(current_chunk)
            current_chunk = []
            
        last_dt = dt

    if len(current_chunk) >= 10:
        chunks.append(current_chunk)

    fast_db = []
    for chunk in chunks:
        full_text = " ".join([m["text"] for m in chunk])
        keywords = get_keywords(full_text)
        if not keywords: continue
        
        # Save a compressed dialogue representation
        dialogue = []
        for m in chunk:
            if "omitted" in m["text"].lower(): continue
            dialogue.append(f'{m["sender"]}: {m["text"]}')
            
        fast_db.append({
            "keywords": keywords,
            "date": chunk[0]["dt"].strftime("%B %d, %Y") if chunk[0]["dt"] else "",
            "dialogue": "\n".join(dialogue)
        })

    # Save Fast DB
    with open(FAST_DB_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(fast_db, f, ensure_ascii=False)
    
    print(f"Saved fast_search_db.json ({len(fast_db)} chunks)")
    print("DONE! Local Memory Engine is ready.")

if __name__ == "__main__":
    main()
