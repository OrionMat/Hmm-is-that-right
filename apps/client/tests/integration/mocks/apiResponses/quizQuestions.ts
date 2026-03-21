/**
 * Three questions: Q1 answered wrong, Q2 and Q3 answered correctly.
 * Expected results: 2/3 correct = 67%.
 */
export const mockQuizQuestions = JSON.stringify({
  questions: [
    {
      id: "q1",
      question: "What is 2+2?",
      options: [
        { id: "q1-a", text: "Three", label: "A" },
        { id: "q1-b", text: "Four", label: "B" }, // correct
        { id: "q1-c", text: "Five", label: "C" },
        { id: "q1-d", text: "Six", label: "D" },
      ],
      correctAnswer: "q1-b",
      explanation: "2+2 equals 4, not 3.",
    },
    {
      id: "q2",
      question: "What color is the sky?",
      options: [
        { id: "q2-a", text: "Green", label: "A" },
        { id: "q2-b", text: "Red", label: "B" },
        { id: "q2-c", text: "Blue", label: "C" }, // correct
        { id: "q2-d", text: "Yellow", label: "D" },
      ],
      correctAnswer: "q2-c",
      explanation: "The sky appears blue due to Rayleigh scattering.",
    },
    {
      id: "q3",
      question: "What is the capital of France?",
      options: [
        { id: "q3-a", text: "London", label: "A" },
        { id: "q3-b", text: "Paris", label: "B" }, // correct
        { id: "q3-c", text: "Berlin", label: "C" },
        { id: "q3-d", text: "Madrid", label: "D" },
      ],
      correctAnswer: "q3-b",
      explanation: "Paris is the capital and largest city of France.",
    },
  ],
});
