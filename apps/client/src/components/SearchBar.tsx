import React, { useState } from "react";
import { IsActiveNewsSources, NewsPiece } from "../dataModel/dataModel";
import { getNewsPieces } from "../service/getNewsPieces";
import { SearchIcon } from "../Icons";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  sourceStates: IsActiveNewsSources;
  setNewsPieces(newsPieces: NewsPiece[]): void;
}

export const SearchBar = ({ sourceStates, setNewsPieces }: SearchBarProps) => {
  const [statement, setStatement] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const news = await getNewsPieces(statement, sourceStates);
    setNewsPieces(news);
  };

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit}>
      <SearchIcon />
      <input
        className={styles.searchInput}
        id="input"
        type="search"
        autoComplete="off"
        spellCheck="false"
        placeholder="Check a fact or statement"
        value={statement}
        onChange={(event) => setStatement(event.target.value)}
      />
    </form>
  );
};
