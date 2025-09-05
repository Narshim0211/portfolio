import crypto from 'node:crypto';

export function computeHmacSha256Hex(secret: string, body: string): string {
  return crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
}

export function verifyOwnerSignature({
  secret,
  header,
  body,
}: {
  secret: string;
  header: string | undefined;
  body: string;
}): boolean {
  if (!header) return false;
  const [algo, hex] = header.split('=');
  if (algo !== 'sha256' || !hex) return false;
  const expected = computeHmacSha256Hex(secret, body);
  // Use timing-safe comparison
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(hex, 'hex'));
}

