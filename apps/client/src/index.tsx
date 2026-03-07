import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { AppRoutes } from "./navigation/AppRoutes";

const router = createBrowserRouter(AppRoutes);
const rootDomElement = document.getElementById("root")!;
const root = createRoot(rootDomElement);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
