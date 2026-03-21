interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const progress = (current / total) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <p className="text-center text-sm text-very-dark-grey mb-2">
        Question {current} of {total}
      </p>
      <div className="w-full h-2 bg-light-grey rounded-full overflow-hidden">
        <div
          className="h-full bg-link rounded-full transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
