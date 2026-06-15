"""
Vector Database Builder using Gemini Embeddings
================================================
Creates semantic embeddings for conversation chunks from WhatsApp chat history.
Uses Google's text-embedding-004 model for high-quality semantic vectors.

Usage:
    python3 build_vector_db.py YOUR_GEMINI_API_KEY

Output:
    src/assets/vector_db.json - Conversation chunks with embedding vectors
"""

import re
import json
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timedelta

CHAT_FILE = "/Users/Shruti/Documents/PROJECTS/games/surprise/chat1yr_25:06:09.txt"
OUTPUT_FILE = "/Users/Shruti/Documents/PROJECTS/games/surprise/src/assets/vector_db.json"

MSG_REGEX = re.compile(
    r'^\u200e?\[(\d{2}/\d{2}/\d{2}),\s+(\d{1,2}:\d{2}:\d{2}(?:\s|\u202f|\u200f|\u202f| )?(?:AM|PM|am|pm| AM| PM))\]\s+([^:]+):\s+(.*)$'
)

def clean_text(text):
    return text.replace('\u200e', '').replace('\u200f', '').strip() if text else ""

def parse_chat():
    """Parse the full WhatsApp export."""
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
                time_str_clean = time_str.replace('\u202f', ' ').replace('\xa0', ' ').strip()
                dt_str = f"{date_str} {time_str_clean}"
                dt = None
                for fmt in ("%d/%m/%y %I:%M:%S %p", "%d/%m/%y %H:%M:%S", "%m/%d/%y %I:%M:%S %p"):
                    try:
                        dt = datetime.strptime(dt_str, fmt)
                        break
                    except ValueError:
                        continue
                current_msg = {"datetime": dt, "sender": sender, "text": msg_text}
            else:
                if current_msg:
                    current_msg["text"] += "\n" + clean_text(line)
        if current_msg:
            messages.append(current_msg)

    print(f"  Parsed {len(messages)} messages.")
    return messages


def chunk_conversations(messages, gap_minutes=60, max_chunk_messages=80, min_chunk_messages=5):
    """
    Group messages into conversation chunks based on time gaps.
    A new conversation starts when there's a gap > gap_minutes.
    """
    chunks = []
    current_chunk = []
    last_dt = None

    for msg in messages:
        dt = msg["datetime"]
        if not dt:
            if current_chunk:
                current_chunk.append(msg)
            continue

        # Start new chunk on time gap
        if last_dt and (dt - last_dt).total_seconds() > gap_minutes * 60:
            if len(current_chunk) >= min_chunk_messages:
                chunks.append(current_chunk)
            current_chunk = []

        current_chunk.append(msg)

        # Also split if chunk gets too long
        if len(current_chunk) >= max_chunk_messages:
            chunks.append(current_chunk)
            current_chunk = []

        last_dt = dt

    if len(current_chunk) >= min_chunk_messages:
        chunks.append(current_chunk)

    print(f"  Created {len(chunks)} conversation chunks.")
    return chunks


def chunk_to_text(chunk):
    """Convert a chunk of messages into a searchable text blob."""
    lines = []
    for msg in chunk:
        text = msg["text"].strip()
        if "omitted" in text.lower():
            continue
        lines.append(f"{msg['sender']}: {text}")
    return "\n".join(lines)


def chunk_to_metadata(chunk):
    """Extract metadata from a chunk."""
    dates = [m["datetime"] for m in chunk if m["datetime"]]
    if not dates:
        return {"date": "unknown", "message_count": len(chunk)}
    
    start = min(dates)
    end = max(dates)
    return {
        "date": start.strftime("%B %d, %Y"),
        "time_range": f"{start.strftime('%I:%M %p')} - {end.strftime('%I:%M %p')}",
        "message_count": len(chunk),
    }


def get_embeddings_batch(texts, api_key, model="gemini-embedding-2"):
    """
    Embed a batch of texts using Gemini's batchEmbedContents endpoint.
    Returns list of embedding vectors.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:batchEmbedContents?key={api_key}"
    
    requests_body = []
    for text in texts:
        # Truncate to ~500 words to stay within limits
        truncated = " ".join(text.split()[:500])
        requests_body.append({
            "model": f"models/{model}",
            "content": {"parts": [{"text": truncated}]},
            "taskType": "RETRIEVAL_DOCUMENT",
            "outputDimensionality": 256  # Reduced dims for compact storage
        })

    payload = json.dumps({"requests": requests_body}).encode('utf-8')
    
    req = urllib.request.Request(url, data=payload, method='POST')
    req.add_header('Content-Type', 'application/json')

    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            embeddings = []
            for emb in data.get("embeddings", []):
                # Round to 4 decimal places to save space
                values = [round(v, 4) for v in emb["values"]]
                embeddings.append(values)
            return embeddings
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        if e.code == 429:
            print(f"  [Rate limited, waiting 30s...] ", end="", flush=True)
            time.sleep(30)
            return get_embeddings_batch(texts, api_key, model)
        print(f"  ❌ API Error {e.code}: {error_body[:200]}")
        raise


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 build_vector_db.py YOUR_GEMINI_API_KEY")
        sys.exit(1)

    api_key = sys.argv[1]

    print("=" * 60)
    print("VECTOR DATABASE BUILDER - Gemini Semantic Embeddings")
    print("=" * 60)

    # Step 1: Parse chat
    print("\n[1/4] Parsing chat file...")
    messages = parse_chat()

    # Step 2: Chunk conversations
    print("\n[2/4] Chunking conversations...")
    chunks = chunk_conversations(messages, gap_minutes=60, max_chunk_messages=80, min_chunk_messages=5)

    # Step 3: Prepare texts
    print("\n[3/4] Preparing chunk texts...")
    chunk_texts = []
    chunk_metadatas = []
    
    for chunk in chunks:
        text = chunk_to_text(chunk)
        # Skip empty or very short chunks
        if len(text.strip()) < 20:
            continue
        chunk_texts.append(text)
        chunk_metadatas.append(chunk_to_metadata(chunk))

    print(f"  Prepared {len(chunk_texts)} non-empty chunks for embedding.")

    # Step 4: Embed all chunks in batches
    print(f"\n[4/4] Embedding {len(chunk_texts)} chunks using Gemini gemini-embedding-2...")
    
    batch_size = 50  # Gemini supports up to 100, but let's be safe
    all_embeddings = []
    total_batches = (len(chunk_texts) + batch_size - 1) // batch_size

    for i in range(0, len(chunk_texts), batch_size):
        batch = chunk_texts[i:i + batch_size]
        batch_num = i // batch_size + 1
        print(f"  Batch {batch_num}/{total_batches} ({len(batch)} texts)...", end=" ", flush=True)
        
        try:
            embeddings = get_embeddings_batch(batch, api_key)
            all_embeddings.extend(embeddings)
            print(f"✅")
        except Exception as e:
            print(f"❌ Error: {e}")
            # On failure, add zero vectors as fallback
            for _ in batch:
                all_embeddings.append([0.0] * 256)
        
        # Rate limit safety (free tier is 15 RPM, so 1 request every 4 seconds)
        if batch_num < total_batches:
            time.sleep(4.5)

    print(f"\n  Embedded {len(all_embeddings)} chunks successfully.")

    # Build the vector DB
    vector_db = {
        "model": "gemini-embedding-2",
        "dimensions": 256,
        "chunk_count": len(chunk_texts),
        "chunks": []
    }

    for idx, (text, meta, embedding) in enumerate(zip(chunk_texts, chunk_metadatas, all_embeddings)):
        # Truncate chunk text to save space (keep first 1000 chars for context)
        vector_db["chunks"].append({
            "id": idx,
            "text": text[:1500],
            "meta": meta,
            "embedding": embedding
        })

    # Write output
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(vector_db, f, ensure_ascii=False)
    
    file_size_mb = len(json.dumps(vector_db, ensure_ascii=False)) / (1024 * 1024)
    print(f"\n{'=' * 60}")
    print(f"DONE! Vector DB built successfully.")
    print(f"  Chunks: {len(vector_db['chunks'])}")
    print(f"  File size: {file_size_mb:.1f} MB")
    print(f"  Output: {OUTPUT_FILE}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
