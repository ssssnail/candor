import {
  createBrowserRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { Landing } from "./pages/Landing";
import { Inbox } from "./pages/Inbox";
import { Submit } from "./pages/Submit";
import { Submitted } from "./pages/Submitted";
import { Privacy } from "./pages/Privacy";
import { Layout } from "./components/Layout";

const routeTree = {
  path: "/",
  component: Layout,
  children: [
    { path: "/", component: Landing },
    { path: "/inbox", component: Inbox },
    { path: "/submitted", component: Submitted },
    { path: "/privacy", component: Privacy },
  ],
};

const router = createBrowserRouter({
  routeTree,
  ...(typeof window !== "undefined" && { hydrationData: { loaderData: {} } }),
});

export { router };
