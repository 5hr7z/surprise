import json

with open('src/assets/songs_data.json', 'r') as f:
    songs = json.load(f)

with open('src/assets/core_memories.json', 'r') as f:
    memories = json.load(f)

from collections import defaultdict
songs_by_date = defaultdict(list)
for song in songs:
    songs_by_date[song['date']].append(song)

with open('/Users/Shruti/.gemini/antigravity-ide/brain/fd520340-4d2f-4286-b1c7-68f27063ea2a/song_options.md', 'w') as f:
    f.write("# 🎵 Spotify Song Options for Memory Lane\n\n")
    f.write("> [!IMPORTANT]\n")
    f.write("> **Live Spotify Embeds cannot render inside the IDE's Markdown Viewer** due to security/XSS restrictions.\n")
    f.write("> **[👉 Click here to open the Interactive Song Selector with Live Playable Spotify Embeds](http://localhost:5173/song_options.html)**\n\n")
    f.write("Here are the songs that were shared in the WhatsApp chat around the dates of each memory. You can copy the **Track ID** and paste it into `src/assets/core_memories.json` to change the song.\n\n")
    
    for i, mem in enumerate(memories):
        f.write(f"## Memory #{i+1}: {mem['title']} ({mem['date']})\n")
        f.write(f"**Current Track ID:** `{mem['trackId']}`\n\n")
        
        if mem['id'] == 'birthday_shruti':
            f.write(f'**User Requested: Enormous Penis** | Track ID: `7dUCFnaGSWLH6SdDP08NLP`\n')
            f.write(f'- [👉 **Listen on Spotify**](https://open.spotify.com/track/7dUCFnaGSWLH6SdDP08NLP)\n\n')
            continue
        elif mem['id'] == 'anniversary':
            f.write(f'**User Requested: Bleeding Love** | Track ID: `7wZUrN8oemZfsEd1CGkbXE`\n')
            f.write(f'- [👉 **Listen on Spotify**](https://open.spotify.com/track/7wZUrN8oemZfsEd1CGkbXE)\n\n')
            continue

    f.write("---\n\n## 📚 Complete Catalog of Extracted Songs by Date\n\n")
    for date, daily_songs in sorted(songs_by_date.items()):
        f.write(f"### {date}\n")
        seen = set()
        for song in daily_songs:
            if song['track_id'] not in seen:
                track_id = song['track_id']
                f.write(f"**Sent by {song['sender']}** | Track ID: `{track_id}`\n")
                f.write(f"- [👉 **Listen on Spotify**](https://open.spotify.com/track/{track_id})\n\n")
                seen.add(track_id)

# Generate HTML file with actual embeds in public directory
html_path = 'public/song_options.html'
with open(html_path, 'w') as f:
    f.write("""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎵 Song Selector - Memories & Chat History</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0b0f19;
            --card-bg: #1e293b;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent: #1db954; /* Spotify green */
            --accent-hover: #1ed760;
            --border-color: #334155;
        }
        body {
            background-color: var(--bg-color);
            color: var(--text-primary);
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 2rem;
            display: flex;
            gap: 2rem;
        }
        #sidebar {
            width: 280px;
            position: sticky;
            top: 2rem;
            height: calc(100vh - 4rem);
            overflow-y: auto;
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        #sidebar h3 {
            margin-top: 0;
            color: var(--text-primary);
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
        }
        .nav-link {
            color: var(--text-secondary);
            text-decoration: none;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.9rem;
            transition: all 0.2s ease;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .nav-link:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--accent);
        }
        #main-content {
            flex: 1;
            max-width: 900px;
        }
        header {
            margin-bottom: 2rem;
        }
        header h1 {
            margin: 0 0 0.5rem 0;
            font-size: 2.5rem;
            background: linear-gradient(135deg, #f8fafc 0%, #1db954 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        header p {
            color: var(--text-secondary);
            margin: 0;
        }
        .memory-section {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            scroll-margin-top: 2rem;
        }
        .memory-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.75rem;
            margin-bottom: 1rem;
        }
        .memory-title {
            margin: 0;
            font-size: 1.4rem;
        }
        .memory-date {
            color: var(--accent);
            font-weight: 600;
        }
        .current-track-info {
            background: rgba(255, 255, 255, 0.03);
            padding: 0.75rem;
            border-radius: 8px;
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .track-id-badge {
            background: #0b0f19;
            color: var(--text-primary);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-family: monospace;
        }
        .options-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        .song-option-card {
            background: rgba(11, 15, 25, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 1rem;
        }
        .song-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }
        .copy-btn {
            background: var(--accent);
            color: #000;
            border: none;
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'Outfit', sans-serif;
        }
        .copy-btn:hover {
            background: var(--accent-hover);
            transform: scale(1.05);
        }
        .copy-btn.copied {
            background: #38bdf8;
            color: #000;
        }
        iframe {
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div id="sidebar">
        <h3>Memory Index</h3>
""")
    for i, mem in enumerate(memories):
        f.write(f'        <a href="#mem-{i+1}" class="nav-link">#{i+1} {mem["title"]}</a>\n')
    f.write("""        <a href="#complete-catalog" class="nav-link" style="border-top: 1px solid var(--border-color); margin-top: 0.5rem; padding-top: 1rem; color: var(--accent); font-weight: bold;">📚 Complete Song Catalog</a>
    </div>
    <div id="main-content">
        <header>
            <h1>🎵 Song Options Selector</h1>
            <p>Listen directly to Spotify embeds below. Click the green <b>Copy Track ID</b> buttons to copy a track ID, then open <code>src/assets/core_memories.json</code> and paste it in for the corresponding memory.</p>
        </header>
""")

    for i, mem in enumerate(memories):
        f.write(f'        <div class="memory-section" id="mem-{i+1}">\n')
        f.write(f'            <div class="memory-header">\n')
        f.write(f'                <h2 class="memory-title">Memory #{i+1}: {mem["title"]}</h2>\n')
        f.write(f'                <span class="memory-date">{mem["date"]}</span>\n')
        f.write(f'            </div>\n')
        f.write(f'            <div class="current-track-info">\n')
        f.write(f'                <span>Current Track ID: <span class="track-id-badge">{mem["trackId"]}</span></span>\n')
        f.write(f'            </div>\n')
        f.write(f'            <div class="options-grid">\n')

        # Check for user specific additions
        if mem['id'] == 'birthday_shruti':
            track_id = '7dUCFnaGSWLH6SdDP08NLP'
            f.write(f'                <div class="song-option-card">\n')
            f.write(f'                    <div class="song-meta">\n')
            f.write(f'                        <span>User Requested: Enormous Penis</span>\n')
            f.write(f'                        <button class="copy-btn" onclick="copyText(this, \'{track_id}\')">Copy Track ID</button>\n')
            f.write(f'                    </div>\n')
            f.write(f'                    <iframe src="https://open.spotify.com/embed/track/{track_id}?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>\n')
            f.write(f'                </div>\n')
        elif mem['id'] == 'anniversary':
            track_id = '7wZUrN8oemZfsEd1CGkbXE'
            f.write(f'                <div class="song-option-card">\n')
            f.write(f'                    <div class="song-meta">\n')
            f.write(f'                        <span>User Requested: Bleeding Love</span>\n')
            f.write(f'                        <button class="copy-btn" onclick="copyText(this, \'{track_id}\')">Copy Track ID</button>\n')
            f.write(f'                    </div>\n')
            f.write(f'                    <iframe src="https://open.spotify.com/embed/track/{track_id}?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>\n')
            f.write(f'                </div>\n')
        else:
            # Let's find songs sent on this date or surrounding dates
            # We can parse memory date (e.g. "June 12, 2025" -> "2025-06-12")
            # Let's write simple code to match dates or just render all daily songs for dates matching the memory date
            # To be simple and robust: we can map written month names to number
            months = {"January": "01", "February": "02", "March": "03", "April": "04", "May": "05", "June": "06", 
                      "July": "07", "August": "08", "September": "09", "October": "10", "November": "11", "December": "12"}
            date_str = mem['date']
            # Clean string like "June 12, 2025" or "July 2025" or "All Year"
            import re
            m = re.search(r'([A-Za-z]+)\s+(\d+),\s+(\d+)', date_str)
            m_month = re.search(r'([A-Za-z]+)\s+(\d{4})', date_str)
            matched_date = None
            if m:
                month, day, year = m.group(1), m.group(2).zfill(2), m.group(3)
                if month in months:
                    matched_date = f"{year}-{months[month]}-{day}"
            elif m_month:
                month, year = m_month.group(1), m_month.group(2)
                # Just match prefix of the month
                if month in months:
                    matched_date = f"{year}-{months[month]}"

            options_found = 0
            if matched_date:
                for date, daily_songs in sorted(songs_by_date.items()):
                    if date.startswith(matched_date):
                        seen = set()
                        for song in daily_songs:
                            if song['track_id'] not in seen:
                                track_id = song['track_id']
                                f.write(f'                <div class="song-option-card">\n')
                                f.write(f'                    <div class="song-meta">\n')
                                f.write(f'                        <span>Sent by {song["sender"]} on {date}</span>\n')
                                f.write(f'                        <button class="copy-btn" onclick="copyText(this, \'{track_id}\')">Copy Track ID</button>\n')
                                f.write(f'                    </div>\n')
                                f.write(f'                    <iframe src="https://open.spotify.com/embed/track/{track_id}?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>\n')
                                f.write(f'                </div>\n')
                                seen.add(track_id)
                                options_found += 1
            
            if options_found == 0:
                # Fallback to current track
                track_id = mem['trackId']
                f.write(f'                <div class="song-option-card">\n')
                f.write(f'                    <div class="song-meta">\n')
                f.write(f'                        <span>Default Track</span>\n')
                f.write(f'                        <button class="copy-btn" onclick="copyText(this, \'{track_id}\')">Copy Track ID</button>\n')
                f.write(f'                    </div>\n')
                f.write(f'                    <iframe src="https://open.spotify.com/embed/track/{track_id}?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>\n')
                f.write(f'                </div>\n')

        f.write(f'            </div>\n')
        f.write(f'        </div>\n')

    # Now add the complete catalog of all 104 songs sorted by date
    f.write('        <div class="memory-section" id="complete-catalog">\n')
    f.write('            <div class="memory-header">\n')
    f.write('                <h2 class="memory-title">📚 Complete Catalog of Extracted Songs</h2>\n')
    f.write('                <span class="memory-date">All 104 Tracks</span>\n')
    f.write('            </div>\n')
    f.write('            <div class="options-grid">\n')

    all_seen = set()
    for date, daily_songs in sorted(songs_by_date.items()):
        for song in daily_songs:
            track_id = song['track_id']
            if track_id not in all_seen:
                f.write(f'                <div class="song-option-card">\n')
                f.write(f'                    <div class="song-meta">\n')
                f.write(f'                        <span>Sent by {song["sender"]} on {date}</span>\n')
                f.write(f'                        <button class="copy-btn" onclick="copyText(this, \'{track_id}\')">Copy Track ID</button>\n')
                f.write(f'                    </div>\n')
                f.write(f'                    <iframe src="https://open.spotify.com/embed/track/{track_id}?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>\n')
                f.write(f'                </div>\n')
                all_seen.add(track_id)

    f.write('            </div>\n')
    f.write('        </div>\n')

    f.write("""    </div>
    <script>
        function copyText(btn, text) {
            navigator.clipboard.writeText(text).then(() => {
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove('copied');
                }, 2000);
            });
        }
    </script>
</body>
</html>
""")


print("Successfully generated song selector HTML at public/song_options.html!")
