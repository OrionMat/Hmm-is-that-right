import { Navigate } from "react-router-dom";
import { AppNavigation } from "./AppNavigation";
import { PageNames } from "../pages/PageNames";
import ErrorPage from "../pages/ErrorPage";
import { FactCheck } from "../pages/FactCheck";
import { SignUp } from "../pages/SignUp/SignUp";
import { Home } from "../pages/Home/Home";

/** The UI app routes  */
export const AppRoutes = [
  {
    path: "/",
    element: <AppNavigation />,
    errorElement: <ErrorPage />,
    children: [
      // Index true here means the home page is the default route for the parent
      // i.e www.example.com goes to www.example.com/home
      { index: true, element: <Navigate to={PageNames.home} replace /> },
      { path: PageNames.home, element: <Home /> },
      { path: PageNames.factCheck, element: <FactCheck /> },
      { path: PageNames.messenger, element: <div>Messenger</div> },
      { path: PageNames.market, element: <div>Market</div> },
      { path: PageNames.account, element: <div>Account</div> },
      { path: PageNames.signUp, element: <SignUp /> },
    ],
  },
];
