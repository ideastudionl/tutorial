import { LocalTaskSource } from "@/lib/sources/local";
import { RedisTaskSource } from "@/lib/sources/redis";
import type { TaskSource } from "@/lib/sources/types";
import { getRedis } from "@/lib/redis";

/**
 * Centrale plek waar de actieve takenbron wordt gekozen.
 *
 * - Is er een Redis-database geconfigureerd (cloud)? -> RedisTaskSource.
 * - Anders (lokaal zonder database) -> LocalTaskSource met bestand.
 *
 * De rest van de app gebruikt alleen getTaskSource() en hoeft niet te
 * weten welke bron actief is. Een latere Akiflow-bron plugt hier net zo in.
 */
let instance: TaskSource | null = null;

export function getTaskSource(): TaskSource {
  if (!instance) {
    const redis = getRedis();
    instance = redis ? new RedisTaskSource(redis) : new LocalTaskSource();
  }
  return instance;
}

export type { TaskSource } from "@/lib/sources/types";
