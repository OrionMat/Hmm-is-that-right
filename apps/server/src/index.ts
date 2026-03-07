import { app } from "./app";
import { getLogger } from "./logger";

const log = getLogger("index");
const port = 3001;

app.listen(port, () => {
  log.info(`app listening at http://localhost:${port}`);
});
