export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizOption {
  id: string;
  text: string;
  label: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, string>; // questionId -> selectedOptionId
  isCompleted: boolean;
  startTime: Date;
  endTime?: Date;
}

export interface QuizAnswer {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number; // in seconds
  answers: QuizAnswer[];
}

// Sample quiz questions - hardcoded for now, API-ready structure
export const sampleQuizQuestions: QuizQuestion[] = [
  {
    id: "1",
    question: "Which of the following headlines contains the most bias?",
    options: [
      { id: "a", text: "City Council Approves New Park Funding", label: "A" },
      {
        id: "b",
        text: "City Council Shamefully Wastes Taxpayer Money on Park",
        label: "B",
      },
      {
        id: "c",
        text: "City Council Votes 5-4 in Favor of Park Funding",
        label: "C",
      },
      {
        id: "d",
        text: "New Park Funding Approved by City Council",
        label: "D",
      },
    ],
    correctAnswer: "b",
    explanation:
      "Option B contains emotional language ('shamefully', 'wastes') which indicates bias.",
  },
  {
    id: "2",
    question:
      "Identify the propaganda technique: 'Everyone supports this new policy'",
    options: [
      { id: "a", text: "Bandwagon", label: "A" },
      { id: "b", text: "Straw Man", label: "B" },
      { id: "c", text: "Ad Hominem", label: "C" },
      { id: "d", text: "False Dichotomy", label: "D" },
    ],
    correctAnswer: "a",
    explanation:
      "The bandwagon technique suggests that everyone is doing something, encouraging others to join.",
  },
  {
    id: "3",
    question:
      "Which source is most likely to be reliable for medical information?",
    options: [
      { id: "a", text: "Personal blog with no credentials", label: "A" },
      { id: "b", text: "Social media post from a friend", label: "B" },
      { id: "c", text: "Peer-reviewed medical journal", label: "C" },
      { id: "d", text: "News article with no sources cited", label: "D" },
    ],
    correctAnswer: "c",
    explanation:
      "Peer-reviewed journals have rigorous editorial processes and expert review.",
  },
  {
    id: "4",
    question: "What does 'clickbait' typically refer to?",
    options: [
      { id: "a", text: "Factual, balanced reporting", label: "A" },
      {
        id: "b",
        text: "Headlines designed to attract attention and generate clicks",
        label: "B",
      },
      { id: "c", text: "In-depth investigative journalism", label: "C" },
      { id: "d", text: "Academic research papers", label: "D" },
    ],
    correctAnswer: "b",
    explanation:
      "Clickbait uses sensational headlines to encourage clicking, often at the expense of accuracy.",
  },
  {
    id: "5",
    question: "Which is an example of a primary source?",
    options: [
      { id: "a", text: "Textbook chapter about historical events", label: "A" },
      {
        id: "b",
        text: "Newspaper article analyzing recent events",
        label: "B",
      },
      {
        id: "c",
        text: "Diary entry from someone who experienced the event",
        label: "C",
      },
      { id: "d", text: "Documentary film about historical events", label: "D" },
    ],
    correctAnswer: "c",
    explanation:
      "Primary sources are direct accounts from people who experienced events firsthand.",
  },
];
