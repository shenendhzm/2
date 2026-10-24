import base64, json, sys, urllib.request, urllib.error
TOKEN=open('/root/.dsh/gh_token').read().strip()
API='https://api.github.com/repos/shenendhzm/2'
def call(m,p,payload=None):
    d=json.dumps(payload).encode() if payload is not None else None
    r=urllib.request.Request(API+p,data=d,method=m)
    r.add_header('Authorization','Bearer '+TOKEN); r.add_header('Accept','application/vnd.github+json')
    r.add_header('User-Agent','dsh'); 
    if d: r.add_header('Content-Type','application/json')
    with urllib.request.urlopen(r,timeout=90) as resp: return json.loads(resp.read().decode())
ref=call('GET','/git/ref/heads/main'); head=ref['object']['sha']
base=call('GET',f'/git/commits/{head}')['tree']['sha']
import sys
files=sys.argv[2:] if len(sys.argv)>2 else ['src/vibe/jam.ts','src/vibe/JamSample.tsx','src/Root.tsx','web/main.tsx','web/index.html']
MSG=sys.argv[1] if len(sys.argv)>1 else 'feat: update'
entries=[]
for f in files:
    raw=open(f,'rb').read()
    blob=call('POST','/git/blobs',{'content':base64.b64encode(raw).decode(),'encoding':'base64'})
    entries.append({'path':f,'mode':'100644','type':'blob','sha':blob['sha']})
    print('blob',f,blob['sha'][:8])
tree=call('POST','/git/trees',{'base_tree':base,'tree':entries})
c=call('POST','/git/commits',{'message':MSG,'tree':tree['sha'],'parents':[head]})
call('PATCH','/git/refs/heads/main',{'sha':c['sha']})
print('main ->',c['sha'][:10])
