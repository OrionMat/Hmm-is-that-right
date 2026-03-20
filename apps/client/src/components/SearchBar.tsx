import React, { useState } from "react";
import { IsActiveNewsSources, NewsPiece } from "../dataModel/dataModel";
import { getNewsPieces } from "../service/getNewsPieces";
import { SearchIcon } from "../Icons";

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
    <form
      className="relative w-[500px] mx-auto mt-0 mb-6 flex items-center"
      onSubmit={handleSubmit}
    >
      <SearchIcon />
      <input
        className="h-[50px] w-full border border-light-grey rounded-[25px] z-[3] pl-[60px] font-mono transition-[box-shadow,border-color] duration-200 hover:shadow-[0_1px_6px_var(--color-dark-grey)] hover:border-transparent focus:outline-none focus:shadow-[0_1px_6px_var(--color-dark-grey)] focus:border-transparent search-cancel-btn"
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
