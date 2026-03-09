import React from "react";
import { Link, Outlet, useNavigation } from "react-router-dom";
import { PageNames } from "../pages/PageNames";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { UnorderedList } from "../components/UnorderedList";
import styles from "./AppNavigation.module.css";

export const AppNavigation = () => {
  const navigation = useNavigation();

  return (
    <div className={styles.appNavigationContainer}>
      {navigation.state === "loading" && <LoadingSpinner />}
      <div id="sidebar" className={styles.sideBarNav}>
        <h2 className={styles.hmmmHeader}>Hmmm is that right...</h2>
        <nav>
          <UnorderedList>
            <li>
              <Link to={`/${PageNames.home}`}>Home</Link>
            </li>
            <li>
              <Link to={`/${PageNames.factCheck}`}>Fact Check</Link>
            </li>
            <li>
              <Link to={`/${PageNames.messenger}`}>Messenger</Link>
            </li>
            <li>
              <Link to={`/${PageNames.market}`}>Market</Link>
            </li>
            <li>
              <Link to={`/${PageNames.account}`}>Account</Link>
            </li>
            <li>
              <div>
                <Link to={`/${PageNames.signUp}`}>Sign up</Link>
                {` / `}
                <Link to={`/${PageNames.login}`}>Login</Link>
              </div>
            </li>
          </UnorderedList>
        </nav>
      </div>
      <Outlet />
    </div>
  );
};
