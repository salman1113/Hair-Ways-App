import urllib.request
import json

key='AIzaSyDHfhehfferNbrEuZ6QFrY3hvWfpdLEwFI'
models=['gemini-flash-latest', 'gemini-2.0-flash-lite', 'gemma-3-4b-it']

for m in models:
    req = urllib.request.Request(
        f'https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={key}', 
        data=json.dumps({'contents': [{'parts':[{'text': 'hi'}]}]}).encode('utf-8'), 
        headers={'Content-Type': 'application/json'}
    )
    try:
        res = urllib.request.urlopen(req)
        print(f'{m}: SUCCESS (Code {res.status})')
    except urllib.error.HTTPError as e:
        print(f'{m}: FAILED (HTTP {e.code}: {e.reason})')
        # If it's a 429, try to parse the body for the limit
        if e.code == 429:
            body = e.read().decode('utf-8')
            try:
                data = json.loads(body)
                print(f"  -> Details: {data['error']['message']}")
            except:
                pass
    except Exception as e:
        print(f'{m}: ERROR ({e})')
