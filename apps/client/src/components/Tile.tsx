import { SelectNewsIcon } from "../icons/NewsIcons";

interface TileProps {
  source: string;
  isActive: boolean;
  url: string;
  handleClick(toggledState: boolean): void;
}

export const Tile = ({ source, isActive, handleClick }: TileProps) => {
  return (
    <button
      className="border border-light-grey bg-transparent rounded-full w-[70px] h-[70px] flex flex-col items-center justify-center cursor-pointer transition-[box-shadow,border-color] duration-200 hover:shadow-[0_1px_6px_var(--color-dark-grey)] hover:border-transparent focus:outline-none focus:shadow-[0_0_16px_var(--color-dark-grey)]"
      onClick={() => handleClick(!isActive)}
      aria-pressed={isActive}
    >
      <SelectNewsIcon source={source} isActive={isActive} />
    </button>
  );
};
