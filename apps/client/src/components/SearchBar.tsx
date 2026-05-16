import React from "react";
import { SearchIcon } from "../icons/NewsIcons";
import { LoadingSpinner } from "./LoadingSpinner";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Controlled text input shaped like a magnifying-glass search bar. Submits on
 * Enter via an inner <form>; the parent owns the value and the submit action.
 */
export const SearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search…",
  isLoading = false,
  disabled = false,
}: SearchBarProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      className="relative w-[500px] max-w-full mx-auto flex items-center"
      onSubmit={handleSubmit}
    >
      <SearchIcon />
      <input
        className={`h-[50px] w-full border border-light-grey rounded-[25px] z-3 pl-[60px] font-mono transition-[box-shadow,border-color] duration-200 hover:shadow-[0_1px_6px_var(--color-dark-grey)] hover:border-transparent focus:outline-none focus:shadow-[0_1px_6px_var(--color-dark-grey)] focus:border-transparent search-cancel-btn${isLoading ? " search-loading" : ""}`}
        id="search-input"
        type="search"
        autoComplete="off"
        spellCheck="false"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      {isLoading && (
        <div className="absolute right-[15px] top-1/2 -translate-y-1/2 z-10 text-very-dark-grey/60">
          <LoadingSpinner className="w-[18px] h-[18px] border-[1.5px]" />
        </div>
      )}
    </form>
  );
};
