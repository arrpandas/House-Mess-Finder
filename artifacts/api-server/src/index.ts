import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];
// Publishing/build should not fail due to missing runtime env.
const port = Number(rawPort ?? "3000");


app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
