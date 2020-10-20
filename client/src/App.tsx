import React from 'react';
import styled from 'styled-components'

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 750px
`

const SearchBar = styled.input`
  border: 1px solid #dfe1e5;
  width: 500px;
  border-radius: 25px;
  z-index: 3;
  height: 50px;
  margin: auto;

  :hover {
    box-shadow: 0 1px 6px rgba(32,33,36,.28);
    border-color: rgba(223,225,229,0);
  }
`

const App = () => {
  return (
    <ContentWrapper id="content">
      <SearchBar id="input" type="search" autoComplete="off" spellCheck="false" placeholder="Check a fact or statement" />
    </ContentWrapper>
  );
}

export default App;
