export const QuizCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-light-grey p-8 w-full max-w-2xl mx-auto">
      <div className="min-h-[300px]">{children}</div>
    </div>
  );
};
