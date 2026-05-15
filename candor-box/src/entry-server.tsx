import { createSSRHandler } from "@tanstack/start/server";
import { getRequestEvent } from "solid-js/web";
import { StartServer } from "@tanstack/start/server";

export default createSSRHandler({
  dispatchTo render(vnode) {
    return new Response("<!DOCTYPE html>", {
      headers: { "Content-Type": "text/html" },
    });
  },
  getRequestEvent: () => getRequestEvent(),
});
