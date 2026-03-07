import React from "react";
import { Link, Outlet, useNavigation } from "react-router-dom";
import { PageNames } from "../pages/PageNames";
import { LoadingSpinner } from "../components/LoadingSpinner";
import styled from "styled-components";
import { colors } from "../styles/colors";
import { UnorderedList } from "../components/UnorderedList";
import { fonts } from "../styles/fonts";

const AppNavigationContainer = styled.div`
  display: flex;
  font-family: ${fonts.primary};
`;

const SideBarNav = styled.div`
  height: 100vh;
  width: fit-content;
  background-color: ${colors.lightBlue};
  padding: 3rem;
  border-radius: 8px;
`;

const HmmmHeader = styled.h2`
  white-space: nowrap;
`;

export const AppNavigation = () => {
  const navigation = useNavigation();

  return (
    <AppNavigationContainer>
      {navigation.state === "loading" && <LoadingSpinner />}
      <SideBarNav id="sidebar">
        <HmmmHeader>Hmmm is that right...</HmmmHeader>
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
      </SideBarNav>
      {/* The Outlet tells this component where to render it's child routes */}
      <Outlet />
    </AppNavigationContainer>
  );
};
