# harbor-mcp

A wrapper around [`harbor-mcp@0.0.2`](https://www.npmjs.com/package/harbor-mcp)
([bupd/harbor-mcp-server](https://github.com/bupd/harbor-mcp-server))
with an anonymous-access patch (`patch.js`, applied via `postinstall`).

Why the patch: upstream requires `HARBOR_API_BASE` + `HARBOR_AUTH_USER` +
`HARBOR_AUTH_PASS`, but our Harbor instance can serve public projects anonymously,
so MCP needs no token. The patch relaxes the check to just `HARBOR_API_BASE`
and only sends an `Authorization` header if `user`/`pass` are set.

If upstream updates and the patch no longer applies, the postinstall script fails
with a warning (the version in `package.json` is pinned on purpose).

## Installation

```bash
cd "<path>/harbor-mcp"
npm install        # installs harbor-mcp@0.0.2 and applies patch.js
node node_modules/harbor-mcp/build/index.js   # smoke test: waits for JSON-RPC on stdin
```

## Agent configuration

For example, in Kilo (`.kilo/kilo.jsonc`):

```jsonc
"harbor": {
  "type": "local",
  "command": ["node", "<path>/harbor-mcp/node_modules/harbor-mcp/build/index.js"],
  "environment": { "HARBOR_API_BASE": "https://<harbor-host>/api/v2.0" }
}
```

The config contains no secrets; access is anonymous. For private projects you
can add `HARBOR_AUTH_USER`/`HARBOR_AUTH_PASS`, which the patch supports.

Upstream 0.0.2 limitation: there are no tools for listing tags/artifacts, so
tag lists must be fetched directly from the Harbor API (`/artifacts`).

`npm audit` reports 2 high-severity vulnerabilities in transitive dependencies
of `harbor-mcp@0.0.2`. This is an accepted risk: it is a dev tool running as a
local stdio process, and the version is pinned for patch reproducibility.
