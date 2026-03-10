import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";

const app = new Hono<{ Bindings: Env }>();

// Helper functions for SSH key handling
function validateSSHPublicKey(key: string): boolean {
  const trimmed = key.trim();
  return (
    trimmed.startsWith("ssh-rsa ") ||
    trimmed.startsWith("ssh-ed25519 ") ||
    trimmed.startsWith("ecdsa-sha2-nistp256 ") ||
    trimmed.startsWith("ecdsa-sha2-nistp384 ") ||
    trimmed.startsWith("ecdsa-sha2-nistp521 ")
  );
}

function extractSSHKeyType(key: string): string {
  const trimmed = key.trim();
  if (trimmed.startsWith("ssh-rsa ")) return "RSA";
  if (trimmed.startsWith("ssh-ed25519 ")) return "ED25519";
  if (trimmed.startsWith("ecdsa-sha2-nistp256 ")) return "ECDSA-256";
  if (trimmed.startsWith("ecdsa-sha2-nistp384 ")) return "ECDSA-384";
  if (trimmed.startsWith("ecdsa-sha2-nistp521 ")) return "ECDSA-521";
  return "UNKNOWN";
}

function generateSSHFingerprint(key: string): string {
  const parts = key.trim().split(" ");
  if (parts.length < 2) return "";
  const keyData = parts[1];
  const hash = keyData.slice(-16);
  return hash.match(/.{1,2}/g)?.join(":") || "";
}

// Auth endpoints
app.get("/api/oauth/google/redirect_url", async (c) => {
  const redirectUrl = await getOAuthRedirectUrl("google", {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });
  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();
  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }
  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });
  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60,
  });
  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get("/api/logout", async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
  if (typeof sessionToken === "string") {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }
  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });
  return c.json({ success: true }, 200);
});

// Vault items endpoints
app.get("/api/vault-items", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM vault_items WHERE user_id = ? ORDER BY created_at DESC"
  )
    .bind(user.id)
    .all();
  return c.json(results);
});

app.post("/api/vault-items", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  
  // Validate SSH key if type is ssh
  if (body.type === "ssh" && body.sshPublicKey) {
    if (!validateSSHPublicKey(body.sshPublicKey)) {
      return c.json({ error: "Invalid SSH public key format" }, 400);
    }
  }

  // Extract SSH key metadata
  let sshKeyType = null;
  let sshFingerprint = null;
  if (body.type === "ssh" && body.sshPublicKey) {
    sshKeyType = extractSSHKeyType(body.sshPublicKey);
    sshFingerprint = generateSSHFingerprint(body.sshPublicKey);
  }
  
  const result = await c.env.DB.prepare(
    `INSERT INTO vault_items (
      user_id, type, name, username, password, website, card_number, card_expiry, card_cvv, note_content,
      ssh_public_key, ssh_private_key, ssh_passphrase, ssh_key_type, ssh_fingerprint, tags, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  )
    .bind(
      user.id,
      body.type,
      body.name,
      body.username || null,
      body.password || null,
      body.website || null,
      body.cardNumber || null,
      body.cardExpiry || null,
      body.cardCvv || null,
      body.noteContent || null,
      body.sshPublicKey || null,
      body.sshPrivateKey || null,
      body.sshPassphrase || null,
      sshKeyType,
      sshFingerprint,
      body.tags ? JSON.stringify(body.tags) : null
    )
    .run();

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM vault_items WHERE id = ?"
  )
    .bind(result.meta.last_row_id)
    .all();

  return c.json(results[0], 201);
});

app.put("/api/vault-items/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const id = c.req.param("id");
  const body = await c.req.json();

  // Verify ownership
  const { results: existing } = await c.env.DB.prepare(
    "SELECT * FROM vault_items WHERE id = ? AND user_id = ?"
  )
    .bind(id, user.id)
    .all();

  if (existing.length === 0) {
    return c.json({ error: "Not found" }, 404);
  }

  // Validate SSH key if type is ssh
  if (body.type === "ssh" && body.sshPublicKey) {
    if (!validateSSHPublicKey(body.sshPublicKey)) {
      return c.json({ error: "Invalid SSH public key format" }, 400);
    }
  }

  // Extract SSH key metadata
  let sshKeyType = null;
  let sshFingerprint = null;
  if (body.type === "ssh" && body.sshPublicKey) {
    sshKeyType = extractSSHKeyType(body.sshPublicKey);
    sshFingerprint = generateSSHFingerprint(body.sshPublicKey);
  }

  await c.env.DB.prepare(
    `UPDATE vault_items 
     SET name = ?, username = ?, password = ?, website = ?, card_number = ?, card_expiry = ?, card_cvv = ?, note_content = ?,
         ssh_public_key = ?, ssh_private_key = ?, ssh_passphrase = ?, ssh_key_type = ?, ssh_fingerprint = ?, tags = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`
  )
    .bind(
      body.name,
      body.username || null,
      body.password || null,
      body.website || null,
      body.cardNumber || null,
      body.cardExpiry || null,
      body.cardCvv || null,
      body.noteContent || null,
      body.sshPublicKey || null,
      body.sshPrivateKey || null,
      body.sshPassphrase || null,
      sshKeyType,
      sshFingerprint,
      body.tags ? JSON.stringify(body.tags) : null,
      id,
      user.id
    )
    .run();

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM vault_items WHERE id = ?"
  )
    .bind(id)
    .all();

  return c.json(results[0]);
});

app.delete("/api/vault-items/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const id = c.req.param("id");

  const result = await c.env.DB.prepare(
    "DELETE FROM vault_items WHERE id = ? AND user_id = ?"
  )
    .bind(id, user.id)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ error: "Not found" }, 404);
  }

  return c.json({ success: true });
});

export default app;
