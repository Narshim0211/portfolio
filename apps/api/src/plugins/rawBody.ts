import { FastifyInstance, FastifyPluginAsync } from 'fastify';

/**
 * Fastify plugin to capture raw request body for HMAC verification.
 * Must be registered before routes that depend on `request.rawBody`.
 */
export const rawBodyPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('onRequest', async (request) => {
    // Only for POST/PUT/PATCH where body matters for signatures
    if (!['POST', 'PUT', 'PATCH'].includes(request.method)) return;
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      request.raw
        .on('data', (chunk: Buffer) => chunks.push(chunk))
        .on('end', () => {
          (request as any).rawBody = Buffer.concat(chunks).toString('utf8');
          resolve();
        })
        .on('error', reject);
    });
  });
};

export default rawBodyPlugin;

