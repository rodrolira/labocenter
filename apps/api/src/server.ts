/**
 * Punto de arranque del backend: crea la app y escucha el puerto.
 */
import { createApp } from "./app";
import { config } from "./shared/config";
import { logger } from "./shared/logger";

const app = createApp();

app.listen(config.API_PORT, () => {
  logger.info(`API escuchando en http://localhost:${config.API_PORT}`);
});
