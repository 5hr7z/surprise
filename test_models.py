import sys
import json
import urllib.request
import urllib.error

api_key = sys.argv[1]
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        for m in data.get("models", []):
            if "embed" in m["name"].lower():
                print(m["name"], m.get("supportedGenerationMethods", []))
except Exception as e:
    print(e)
