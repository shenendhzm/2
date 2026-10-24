import base64, json, os, sys, urllib.request, urllib.error

TOKEN = open('/root/.dsh/gh_token').read().strip()
API = 'https://api.github.com/repos/shenendhzm/2'

def call(method, path, payload=None, retries=3):
    url = API + path
    data = json.dumps(payload).encode() if payload is not None else None
    for attempt in range(retries):
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header('Authorization', 'Bearer ' + TOKEN)
        req.add_header('Accept', 'application/vnd.github+json')
        req.add_header('User-Agent', 'dsh-deploy')
        if data:
            req.add_header('Content-Type', 'application/json')
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            body = e.read().decode()[:400]
            print(f'  ! {method} {path} -> {e.code} {body}', file=sys.stderr)
            if attempt == retries - 1:
                raise
        except Exception as e:
            print(f'  ! {method} {path} -> {e}', file=sys.stderr)
    raise RuntimeError('failed')

ref = call('GET', '/git/ref/heads/gh-pages')
head = ref['object']['sha']
commit = call('GET', f'/git/commits/{head}')
base_tree = commit['tree']['sha']
print('head', head[:10], 'tree', base_tree[:10])

files = ['dist-web/index.html', 'dist-web/bundle.js', 'dist-web/newton-sample.wav']
entries = []
for f in files:
    raw = open(f, 'rb').read()
    blob = call('POST', '/git/blobs', {
        'content': base64.b64encode(raw).decode(),
        'encoding': 'base64',
    })
    name = os.path.basename(f)
    entries.append({'path': name, 'mode': '100644', 'type': 'blob', 'sha': blob['sha']})
    print('blob', name, len(raw), blob['sha'][:10])
entries.append({'path': '.nojekyll', 'mode': '100644', 'type': 'blob', 'sha': call('POST', '/git/blobs', {'content': '', 'encoding': 'base64'})['sha']})

tree = call('POST', '/git/trees', {'base_tree': base_tree, 'tree': entries})
newc = call('POST', '/git/commits', {
    'message': 'deploy: newton first law 15s sample',
    'tree': tree['sha'],
    'parents': [head],
})
call('PATCH', '/git/refs/heads/gh-pages', {'sha': newc['sha'], 'force': True})
print('pushed', newc['sha'])
