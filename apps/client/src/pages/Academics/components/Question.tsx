export const Question = ({ text }: { text: string }) => {
  return (
    <h2 className="text-xl font-semibold text-gray-800 leading-relaxed mb-8 text-center">
      {text}
    </h2>
  );
};
