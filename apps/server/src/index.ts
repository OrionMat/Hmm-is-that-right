import { app } from "./app";
import { getLogger } from "./logger";

const log = getLogger("index");
const port = 3001;

// dotenv, tsx watch, the various LLM SDKs, and our own AbortControllers each
// register process-level exit listeners. The 10-listener default trips a
// MaxListenersExceededWarning on every dev startup; bumping the cap is the
// cleanest fix unless we find a single offending module to patch.
process.setMaxListeners(20);

app.listen(port, () => {
  log.info(`app listening at http://localhost:${port}`);
});
