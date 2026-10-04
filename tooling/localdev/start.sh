#!/usr/bin/env bash
# Starts the local backing services for `pnpm dev`:
#   - Postgres 16          127.0.0.1:54322  (stands in for Supabase)
#   - Neon ws proxy        127.0.0.1:54330  (lets the edge DB driver reach Postgres)
#   - Asterisk (fake PSTN) ws://<host>:8088/ws, RTP udp 10000-10100 (stands in for sipgate)
# State lives in <repo>/.localdev (gitignored). Ctrl-C stops everything.
set -euo pipefail

if ! command -v postgres >/dev/null || ! command -v asterisk >/dev/null; then
  exec nix shell nixpkgs#postgresql_16 nixpkgs#asterisk --command "$0" "$@"
fi

here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
state="$root/.localdev"
pg_port=54322
mkdir -p "$state"

pids=()
cleanup() {
  trap - EXIT INT TERM
  for pid in "${pids[@]}"; do kill "$pid" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# --- Postgres ---------------------------------------------------------------
pgdata="$state/postgres"
if [ ! -f "$pgdata/PG_VERSION" ]; then
  initdb -D "$pgdata" -U postgres --auth=trust >/dev/null
fi
postgres -D "$pgdata" -p "$pg_port" -k "$pgdata" -c listen_addresses=127.0.0.1 &
pids+=($!)
until pg_isready -q -h 127.0.0.1 -p "$pg_port" -U postgres; do sleep 0.2; done

# --- Neon ws proxy ----------------------------------------------------------
PG_PORT="$pg_port" node "$here/ws-proxy.js" &
pids+=($!)

# --- Asterisk ---------------------------------------------------------------
ast_pkg="$(dirname "$(dirname "$(readlink -f "$(command -v asterisk)")")")"
ast="$state/asterisk"
mkdir -p "$ast"/{etc,lib/keys,run,log,spool}
# stock defaults for the core configs Asterisk complains about, ours on top
install -m 644 "$ast_pkg"/etc/asterisk/{acl,ccss,cdr,cel,features,indications,pjproject,udptl}.conf "$ast/etc/"
install -m 644 "$here"/asterisk/*.conf "$ast/etc/"
cat >"$ast/etc/asterisk.conf" <<CONF
[directories]
astetcdir => $ast/etc
astmoddir => $ast_pkg/lib/asterisk/modules
astvarlibdir => $ast/lib
astdbdir => $ast/lib
astkeydir => $ast/lib
astdatadir => $ast_pkg/var/lib/asterisk
astagidir => $ast_pkg/var/lib/asterisk/agi-bin
astspooldir => $ast/spool
astrundir => $ast/run
astlogdir => $ast/log
astsbindir => $ast_pkg/bin
CONF
asterisk -f -C "$ast/etc/asterisk.conf" &
pids+=($!)

echo
echo "localdev services up. SIP login in the app: dev / dev  (or dev2 / dev2)"
echo "Asterisk CLI: asterisk -C $ast/etc/asterisk.conf -rvvv    Stop: Ctrl-C"
wait -n
