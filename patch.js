const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "node_modules", "harbor-mcp", "build", "lib", "api.js");
if (!fs.existsSync(file)) {
  console.error("harbor-mcp build/lib/api.js not found, nothing to patch");
  process.exit(0);
}
let s = fs.readFileSync(file, "utf8");
if (s.includes("Kilo patch")) {
  console.log("api.js already patched");
  process.exit(0);
}

const oldCheck = 'if (!apiBase || !authUser || !authPass) {\n    throw new Error("Missing required Harbor configuration. Please set HARBOR_API_BASE, HARBOR_AUTH_USER, and HARBOR_AUTH_PASS environment variables.");\n}';
const newCheck = 'if (!apiBase) {\n    throw new Error("Missing required Harbor configuration. Please set HARBOR_API_BASE environment variable.");\n}\n// Kilo patch: anonymous access when HARBOR_AUTH_USER/HARBOR_AUTH_PASS are not set.';
const oldAuth = 'if (needsAuth) {\n        headers.Authorization = createAuthHeader(authUser, authPass);\n    }';
const newAuth = 'if (needsAuth && authUser && authPass) {\n        headers.Authorization = createAuthHeader(authUser, authPass);\n    }';

if (!s.includes(oldCheck) || !s.includes(oldAuth)) {
  console.error("WARNING: api.js does not match expected upstream (harbor-mcp version changed?), patch NOT applied");
  process.exit(1);
}
s = s.replace(oldCheck, newCheck).replace(oldAuth, newAuth);
fs.writeFileSync(file, s);
console.log("api.js patched for anonymous access");
