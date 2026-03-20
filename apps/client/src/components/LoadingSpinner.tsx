export const LoadingSpinner = ({
  className = "w-8 h-8 border-[0.25em]",
}: {
  className?: string;
}) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block align-text-bottom border-solid border-current border-r-transparent rounded-full animate-spinner ${className}`}
    />
  );
};
