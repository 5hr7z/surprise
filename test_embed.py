import sys, json, urllib.request

api_key = sys.argv[1]
model = "gemini-embedding-2"
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:embedContent?key={api_key}"

payload = json.dumps({
    "model": f"models/{model}",
    "content": {"parts": [{"text": "hello"}]}
}).encode('utf-8')

req = urllib.request.Request(url, data=payload, method='POST')
req.add_header('Content-Type', 'application/json')
try:
    with urllib.request.urlopen(req) as response:
        print("embedContent works")
except Exception as e:
    print("embedContent error:", e)

url2 = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:batchEmbedContents?key={api_key}"
payload2 = json.dumps({
    "requests": [{
        "model": f"models/{model}",
        "content": {"parts": [{"text": "hello"}]}
    }]
}).encode('utf-8')

req2 = urllib.request.Request(url2, data=payload2, method='POST')
req2.add_header('Content-Type', 'application/json')
try:
    with urllib.request.urlopen(req2) as response:
        print("batchEmbedContents works")
except Exception as e:
    print("batchEmbedContents error:", e)
