import React from "react";
import { Link, Outlet, useNavigation } from "react-router-dom";
import { PageNames } from "../pages/PageNames";
import { LoadingSpinner } from "../components/LoadingSpinner";
import styled from "styled-components";

const AppNavigationContainer = styled.div`
  display: flex;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas,
    Liberation Mono, monospace;
`;

const SideBarNav = styled.div`
  height: 100vh;
  width: fit-content;
  background-color: rgb(240 244 249);
  padding: 3rem;
  border-radius: 8px;
  color: rgb(117 117 117);
`;

const HmmmHeader = styled.h2`
  overflow: hidden; /* Ensures the content is not revealed until the animation */
  border-right: 0.15em solid transparent; /* The typewriter cursor */
  white-space: nowrap;
  animation: typing 2s steps(50, end), blink-caret 1.5s step-end 3;

  /* The typing effect */
  @keyframes typing {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }

  /* The typewriter blinking cursor effect */
  @keyframes blink-caret {
    from,
    100% {
      border-color: transparent;
    }
    50% {
      border-color: rgb(117 117 117);
    }
  }
`;

export const AppNavigation = () => {
  const navigation = useNavigation();

  return (
    <AppNavigationContainer>
      {navigation.state === "loading" && <LoadingSpinner />}
      <SideBarNav id="sidebar">
        <HmmmHeader>Hmmm is that right...</HmmmHeader>
        <nav>
          <ul>
            <li>
              <Link to={`/${PageNames.home}`}>Home</Link>
            </li>
            <li>
              <Link to={`/${PageNames.factCheck}`}>Fact Check</Link>
            </li>
            <li>
              <div>
                <Link to={`/${PageNames.signUp}`}>Sign up</Link>
                {` / `}
                <Link to={`/${PageNames.login}`}>Login</Link>
              </div>
            </li>
          </ul>
        </nav>
      </SideBarNav>
      {/* The Outlet tells this component where to render it's child routes */}
      <Outlet />
    </AppNavigationContainer>
  );
};
