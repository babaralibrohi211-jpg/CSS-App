import { createHash } from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";

/**
 * Sliding-window rate limiter backed by Firestore. SERVER ONLY.
 * Uses a NEW internal collection `_email_rate_limits` — it does not touch
 * your existing collections (users, etc.). Doc IDs are hashed, so no raw
 * emails or IPs are stored.
 */
const COLLECTION = "_email_rate_limits";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export async function checkRateLimit(
  key: string,
  { maxRequests, windowSeconds }: { maxRequests: number; windowSeconds: number }
): Promise<RateLimitResult> {
  const id = createHash("sha256").update(key).digest("hex").slice(0, 40);
  const ref = adminDb.collection(COLLECTION).doc(id);
  const now = Timestamp.now();
  const windowStartMs = now.toMillis() - windowSeconds * 1000;

  try {
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const hits: Timestamp[] = (snap.data()?.hits ?? []).filter(
        (t: Timestamp) => t.toMillis() > windowStartMs
      );

      if (hits.length >= maxRequests) {
        const oldest = hits[0].toMillis();
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((oldest + windowSeconds * 1000 - now.toMillis()) / 1000)
        );
        return { allowed: false, retryAfterSeconds };
      }

      tx.set(ref, { hits: [...hits, now], updatedAt: FieldValue.serverTimestamp() });
      return { allowed: true };
    });
  } catch {
    // Fail-open so email delivery never hard-breaks on limiter errors.
    console.error(`[rateLimit] transaction failed for key hash ${id}`);
    return { allowed: true };
  }
}
