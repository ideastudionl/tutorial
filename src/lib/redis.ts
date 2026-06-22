import { Redis } from "@upstash/redis";

/**
 * Maakt een Redis-client op basis van omgevingsvariabelen, of geeft null
 * terug als die niet ingesteld zijn (bijv. lokaal zonder database).
 *
 * Ondersteunt zowel de Upstash-namen als de KV-namen die de Vercel-
 * integratie injecteert.
 */
export function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;
  return new Redis({ url, token });
}
