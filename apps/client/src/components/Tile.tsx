import { SelectNewsIcon } from "../icons/NewsIcons";

interface TileProps {
  source: string;
  isActive: boolean;
  handleClick(toggledState: boolean): void;
  disabled?: boolean;
}

export const Tile = ({ source, isActive, handleClick, disabled = false }: TileProps) => {
  return (
    <button
      className="border border-light-grey bg-transparent rounded-full w-[70px] h-[70px] flex flex-col items-center justify-center transition-[box-shadow,border-color] duration-200 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer hover:shadow-[0_1px_6px_var(--color-dark-grey)] hover:border-transparent focus:outline-none focus:shadow-[0_0_16px_var(--color-dark-grey)]"
      onClick={() => handleClick(!isActive)}
      aria-pressed={isActive}
      disabled={disabled}
    >
      <SelectNewsIcon source={source} isActive={isActive} />
    </button>
  );
};
