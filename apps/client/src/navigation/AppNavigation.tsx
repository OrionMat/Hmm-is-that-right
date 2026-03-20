import { Link, Outlet, useNavigation } from "react-router-dom";
import { PageNames } from "../pages/PageNames";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { UnorderedList } from "../components/UnorderedList";

export const AppNavigation = () => {
  const navigation = useNavigation();

  return (
    <div className="flex font-mono">
      {navigation.state === "loading" && <LoadingSpinner />}
      <div
        id="sidebar"
        className="h-screen w-fit bg-light-blue p-12 rounded-lg"
      >
        <h2 className="text-2xl font-bold whitespace-nowrap mb-8">
          Hmmm is that right...
        </h2>
        <nav>
          <UnorderedList>
            <li>
              <Link
                to={`/${PageNames.home}`}
                className="text-blue-600 hover:underline"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to={`/${PageNames.factCheck}`}
                className="text-blue-600 hover:underline"
              >
                Fact Check
              </Link>
            </li>
            <li>
              <Link
                to={`/${PageNames.messenger}`}
                className="text-blue-600 hover:underline"
              >
                Messenger
              </Link>
            </li>
            <li>
              <Link
                to={`/${PageNames.market}`}
                className="text-blue-600 hover:underline"
              >
                Market
              </Link>
            </li>
            <li>
              <Link
                to={`/${PageNames.account}`}
                className="text-blue-600 hover:underline"
              >
                Account
              </Link>
            </li>
            <li>
              <div className="flex gap-1">
                <Link
                  to={`/${PageNames.signUp}`}
                  className="text-blue-600 hover:underline"
                >
                  Sign up
                </Link>
                <span>/</span>
                <Link
                  to={`/${PageNames.login}`}
                  className="text-blue-600 hover:underline"
                >
                  Login
                </Link>
              </div>
            </li>
          </UnorderedList>
        </nav>
      </div>
      {/* The Outlet tells this component where to render it's child routes */}
      <Outlet />
    </div>
  );
};
