interface QuizStatsProps {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const QuizStats = ({
  totalQuestions,
  correctAnswers,
  timeSpent,
}: QuizStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
      {[
        { value: totalQuestions, label: "Total Questions" },
        { value: correctAnswers, label: "Correct Answers" },
        { value: formatTime(timeSpent), label: "Time Spent" },
      ].map(({ value, label }) => (
        <div
          key={label}
          className="text-center p-6 rounded-xl bg-gray-50 border border-light-grey"
        >
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm text-very-dark-grey mt-2">{label}</p>
        </div>
      ))}
    </div>
  );
};
