import { StaticRouter } from "@tanstack/start/router";
import { mount as mountClient, StartClient } from "@tanstack/start/client";

if (typeof window !== "undefined") {
  mountClient();
}

export { StaticRouter };
