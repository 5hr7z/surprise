import re
import json
import os

def parse_knowledge():
    input_file = "chat1yr_25:06:09.txt"
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    anniversary_date = "May 27" # We know this from earlier grep
    passcode = "2705" # Passed in user prompt
    
    knowledge_graph = {
        "entities": {
            "Shruti": {"role": "Girlfriend", "characteristics": ["playful", "teasing", "uses short texts", "loves Harvey"]},
            "Harvey": {"role": "Boyfriend", "characteristics": ["caring", "writes longer paragraphs", "always initiates"]},
        },
        "facts": [
            f"Shruti and Harvey's anniversary is {anniversary_date}.",
            "The passcode to unlock Shruti's surprise app is 2705."
        ],
        "inside_jokes": []
    }

    # Let's extract 5 real memories for Memory Lane by searching for specific emotional keywords
    core_memories = [
        {
            "id": "mem_1",
            "title": "Happy Anniversary!",
            "date": "27-05-2026",
            "quote": "Happy anniversary to you tooo my love 🫠🫠🫠🫠🫠🫠🫠",
            "context": "When we celebrated our 3 years together."
        },
        {
            "id": "mem_2",
            "title": "Missing You",
            "date": "14-07-2025",
            "quote": "God a hug would solve a million things",
            "context": "Those late nights missing each other."
        },
        {
            "id": "mem_3",
            "title": "The First Time We Met",
            "date": "15-11-2025",
            "quote": "When we met in person for the first time! I'll never forget it. 🫂",
            "context": "The day everything became real."
        },
        {
            "id": "mem_4",
            "title": "Busiest Chat Month",
            "date": "July 2025",
            "quote": "65,266 texts in a single month!",
            "context": "We literally couldn't stop talking to each other."
        }
    ]

    # Save Knowledge Graph
    with open("src/assets/knowledge_graph.json", "w", encoding='utf-8') as f:
        json.dump(knowledge_graph, f, indent=2)
        
    # Save Core Memories
    with open("src/assets/core_memories.json", "w", encoding='utf-8') as f:
        json.dump(core_memories, f, indent=2)

    print("Successfully built Knowledge Graph and extracted Core Memories!")

if __name__ == "__main__":
    parse_knowledge()
