import React from "react";
import { AppNavigation } from "./AppNavigation";
import { PageNames } from "../pages/PageNames";
import ErrorPage from "../pages/ErrorPage";
import { FactCheck } from "../pages/FactCheck";
import { SignUp } from "../pages/SignUp/SignUp";

/** The UI app routes  */
export const AppRoutes = [
  {
    path: "/",
    element: <AppNavigation />,
    errorElement: <ErrorPage />,
    children: [
      { path: PageNames.home, element: <div>Home</div> },
      { path: PageNames.factCheck, element: <FactCheck /> },
      { path: PageNames.messenger, element: <div>Messenger</div> },
      { path: PageNames.market, element: <div>Market</div> },
      { path: PageNames.account, element: <div>Account</div> },
      { path: PageNames.signUp, element: <SignUp /> },
    ],
  },
];
