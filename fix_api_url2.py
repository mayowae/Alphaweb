import paramiko, time

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"
OUT_FILE = r"C:\Users\trade\Documents\Alphaweb-main\fix_api_url2.txt"

def run(ssh, cmd, timeout=300):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    stdout.channel.recv_exit_status()
    o = stdout.read().decode("utf-8", errors="replace").strip()
    e = stderr.read().decode("utf-8", errors="replace").strip()
    return (o + ("\n" + e if e else "")).strip()

lines = []
def say(*args):
    msg = " ".join(str(a) for a in args)
    print(msg)
    lines.append(msg)

def banner(t):
    say(f"\n{'='*60}\n  {t}\n{'='*60}")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS, timeout=10, allow_agent=False, look_for_keys=False)
say("Connected")

# ─── STEP 1: Find the actual project directory on the VPS ────────────────────
banner("STEP 1: Find the project directory from PM2 config")
say(run(ssh, r"""
echo "=== PM2 env for alphaweb-frontend ==="
pm2 describe alphaweb-frontend 2>/dev/null | grep -E 'script|cwd|exec|path' | head -10

echo ""
echo "=== PM2 JSON config ==="
pm2 show alphaweb-frontend 2>/dev/null | grep -E 'script path|cwd|exec path' | head -5

echo ""
echo "=== Find all .env files with NEXT_PUBLIC on VPS ==="
find / -name '.env' -not -path '*/node_modules/*' -not -path '/proc/*' 2>/dev/null | \
    xargs grep -l 'NEXT_PUBLIC' 2>/dev/null | head -10

echo ""
echo "=== Find all package.json with next dependency ==="
find / -name 'package.json' -not -path '*/node_modules/*' -not -path '/proc/*' 2>/dev/null | \
    xargs grep -l '"next"' 2>/dev/null | head -10
"""))

# ─── STEP 2: Fix .env and rebuild ─────────────────────────────────────────────
banner("STEP 2: Fix .env in correct location and rebuild")
say(run(ssh, r"""
# Get the project dir from PM2's cwd
PROJ_DIR=$(pm2 show alphaweb-frontend 2>/dev/null | grep 'exec cwd' | awk '{print $NF}')

if [ -z "$PROJ_DIR" ]; then
    # Try another way
    PROJ_DIR=$(pm2 describe 1 2>/dev/null | grep 'exec cwd' | awk '{print $NF}')
fi

if [ -z "$PROJ_DIR" ]; then
    # Find it from the script path
    PROJ_DIR=$(pm2 list --json 2>/dev/null | python3 -c "
import json,sys
data=json.load(sys.stdin)
for p in data:
    if 'frontend' in p.get('name','').lower():
        print(p.get('pm_cwd','') or p.get('pm2_env',{}).get('pm_cwd',''))
        break
" 2>/dev/null)
fi

echo "PM2 cwd: $PROJ_DIR"

# Also look for it near the backend
BACKEND_DIR=$(pm2 show alphaweb-backend 2>/dev/null | grep 'exec cwd' | awk '{print $NF}')
echo "Backend dir: $BACKEND_DIR"

# The frontend is often one level up from backend
FRONTEND_DIR=$(dirname "$BACKEND_DIR" 2>/dev/null)
echo "Frontend guess: $FRONTEND_DIR"

for d in "$PROJ_DIR" "$FRONTEND_DIR" "$BACKEND_DIR" "$(dirname $BACKEND_DIR)"; do
    if [ -f "$d/.env" ] && grep -q 'NEXT_PUBLIC' "$d/.env" 2>/dev/null; then
        echo "Found .env with NEXT_PUBLIC at: $d"
        FOUND="$d"
        break
    fi
    if [ -f "$d/next.config.ts" ] || [ -f "$d/next.config.js" ]; then
        echo "Found Next.js config at: $d"
        FOUND="$d"
        break
    fi
done

echo ""
echo "=== Using: $FOUND ==="
if [ -n "$FOUND" ]; then
    cat "$FOUND/.env" | grep -E 'API_URL' | head -5
fi
"""))

# ─── STEP 3: Direct approach — use PM2 JSON to get paths ─────────────────────
banner("STEP 3: Get exact paths from PM2 JSON")
say(run(ssh, r"""
pm2 list --json 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for p in data:
        name = p.get('name', '')
        cwd = p.get('pm_cwd') or p.get('pm2_env', {}).get('pm_cwd', '')
        script = p.get('pm2_env', {}).get('pm_exec_path', '')
        print(f'Name: {name}  |  CWD: {cwd}  |  Script: {script}')
except Exception as e:
    print('Error:', e)
"
"""))

# ─── STEP 4: Fix env and rebuild from the correct directory ──────────────────
banner("STEP 4: Fix .env and trigger Next.js rebuild")
say(run(ssh, r"""
# Get frontend cwd from PM2
PROJ=$(pm2 list --json 2>/dev/null | python3 -c "
import json,sys
try:
    for p in json.load(sys.stdin):
        if 'frontend' in p.get('name','').lower():
            cwd = p.get('pm_cwd') or p.get('pm2_env',{}).get('pm_cwd','')
            print(cwd)
            break
except: pass
" 2>/dev/null)

if [ -z "$PROJ" ]; then
    echo "Could not determine frontend dir from PM2"
    # Fallback: search by next.config
    PROJ=$(find /root /home -name 'next.config.*' -not -path '*/node_modules/*' 2>/dev/null | head -1 | xargs dirname 2>/dev/null)
fi

echo "Project directory: $PROJ"

if [ -z "$PROJ" ] || [ ! -d "$PROJ" ]; then
    echo "ERROR: Cannot find Next.js project"
    exit 1
fi

# Show current env
echo ""
echo "=== Current .env API_URL ==="
grep -E 'NEXT_PUBLIC_API_URL' "$PROJ/.env" 2>/dev/null || echo "No .env found at $PROJ"

# Fix the .env
cp "$PROJ/.env" "$PROJ/.env.bak.$(date +%s)" 2>/dev/null

# Replace ANY variant of the NEXT_PUBLIC_API_URL line
python3 -c "
import re, sys
path = '$PROJ/.env'
try:
    with open(path) as f: content = f.read()
    # Remove all NEXT_PUBLIC_API_URL lines (including commented duplicates)
    content = re.sub(r'^NEXT_PUBLIC_API_URL=.*$', '', content, flags=re.MULTILINE)
    # Add the single correct line at top
    content = 'NEXT_PUBLIC_API_URL=https://alphakolect.com\n' + content.lstrip('\n')
    with open(path, 'w') as f: f.write(content)
    print('Fixed .env')
except Exception as e:
    print('Error:', e)
"

echo ""
echo "=== Updated .env (API_URL) ==="
grep 'NEXT_PUBLIC_API_URL' "$PROJ/.env"

# Rebuild Next.js
echo ""
echo "=== Building Next.js (this may take 2-3 minutes) ==="
cd "$PROJ"
NEXT_PUBLIC_API_URL=https://alphakolect.com npm run build 2>&1 | tail -20
echo "Build exit code: $?"
""", timeout=300))

# ─── STEP 5: Restart frontend via PM2 ────────────────────────────────────────
banner("STEP 5: Restart alphaweb-frontend via PM2")
say(run(ssh, r"""
pm2 restart alphaweb-frontend 2>&1
sleep 3
pm2 list
""", timeout=30))

# ─── STEP 6: Final test ───────────────────────────────────────────────────────
banner("STEP 6: Test that /merchant/login works correctly (no port in URL)")
time.sleep(5)
say(run(ssh, r"""
echo "=== /health ==="
curl -sk --resolve 'alphakolect.com:443:127.0.0.1' https://alphakolect.com/health

echo ""
echo "=== /merchant/login (expect JSON error, NOT port 8082 redirect) ==="
curl -sk --resolve 'alphakolect.com:443:127.0.0.1' \
  -X POST -H 'Content-Type: application/json' \
  -d '{"email":"x@x.com","password":"wrong"}' \
  https://alphakolect.com/merchant/login
"""))

ssh.close()
say("\nDone.")

with open(OUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"\n✅ Saved to {OUT_FILE}")
