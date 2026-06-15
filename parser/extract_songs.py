import re
import json
from datetime import datetime

CHAT_FILE = "/Users/Shruti/Documents/PROJECTS/games/surprise/chat1yr_25:06:09.txt"
OUTPUT_FILE = "/Users/Shruti/Documents/PROJECTS/games/surprise/src/assets/songs_data.json"

MSG_REGEX = re.compile(
    r'^\u200e?\[(\d{2}/\d{2}/\d{2}),\s+(\d{1,2}:\d{2}:\d{2}(?:\s|\u202f|\u200f|\u202f| )?(?:AM|PM|am|pm| AM| PM))\]\s+([^:]+):\s+(.*)$'
)

# Regex to find Spotify track URLs
SPOTIFY_REGEX = re.compile(r'https://open\.spotify\.com/track/([a-zA-Z0-9]+)')

def clean_text(text):
    return text.replace('\u200e', '').replace('\u200f', '').strip() if text else ""

def extract_songs():
    print("Extracting Spotify tracks from chat history...")
    songs = []
    current_msg = None
    
    with open(CHAT_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            match = MSG_REGEX.match(line)
            if match:
                if current_msg:
                    # Process current_msg before starting new one
                    spotify_matches = SPOTIFY_REGEX.findall(current_msg["text"])
                    for track_id in spotify_matches:
                        songs.append({
                            "date": current_msg["date"],
                            "sender": current_msg["sender"],
                            "track_id": track_id,
                            "url": f"https://open.spotify.com/track/{track_id}"
                        })
                
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
                        
                if dt:
                    current_msg = {
                        "date": dt.strftime("%Y-%m-%d"),
                        "sender": sender,
                        "text": msg_text
                    }
                else:
                    current_msg = None
            else:
                if current_msg:
                    current_msg["text"] += "\n" + clean_text(line)
                    
        # Process the final message
        if current_msg:
            spotify_matches = SPOTIFY_REGEX.findall(current_msg["text"])
            for track_id in spotify_matches:
                songs.append({
                    "date": current_msg["date"],
                    "sender": current_msg["sender"],
                    "track_id": track_id,
                    "url": f"https://open.spotify.com/track/{track_id}"
                })

    print(f"Found {len(songs)} Spotify tracks shared in chat.")
    
    # Save to JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out:
        json.dump(songs, out, indent=2)

if __name__ == "__main__":
    extract_songs()

