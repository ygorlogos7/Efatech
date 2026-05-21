import { warnIfProductionWithoutRedis } from "@/lib/upstash-redis";

/** Executado ao subir o servidor Next — alerta cedo se produção sem Upstash. */
export async function register() {
  warnIfProductionWithoutRedis();
}
