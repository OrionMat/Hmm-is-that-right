import { QuizOption } from "../../../dataModel/quizModel";

interface OptionsProps {
  options: QuizOption[];
  selectedOptionId?: string;
  correctAnswerId?: string;
  showFeedback?: boolean;
  onOptionSelect: (optionId: string) => void;
}

type OptionState = "correct" | "incorrect" | "selected" | "default";

function getOptionState(
  isSelected: boolean,
  isCorrect: boolean,
  showFeedback: boolean,
): OptionState {
  if (showFeedback && isCorrect) return "correct";
  if (showFeedback && !isCorrect && isSelected) return "incorrect";
  if (isSelected) return "selected";
  return "default";
}

const optionStyles: Record<
  OptionState,
  { border: string; bg: string; circle: string }
> = {
  correct:   { border: "border-brand-green", bg: "bg-green-50",  circle: "bg-brand-green border-brand-green" },
  incorrect: { border: "border-danger-red",  bg: "bg-red-50",    circle: "bg-danger-red border-danger-red"   },
  selected:  { border: "border-link",        bg: "bg-blue-50",   circle: "bg-link border-link"               },
  default:   { border: "border-light-grey",  bg: "bg-white",     circle: "bg-white border-light-grey"        },
};

export const Options = ({
  options,
  selectedOptionId,
  correctAnswerId,
  showFeedback = false,
  onOptionSelect,
}: OptionsProps) => {
  return (
    <div className="flex flex-col gap-4">
      {options.map((option) => {
        const isSelected = selectedOptionId === option.id;
        const isCorrect = correctAnswerId === option.id;
        const { border, bg, circle } = optionStyles[
          getOptionState(isSelected, isCorrect, showFeedback)
        ];

        return (
          <label
            key={option.id}
            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${border} ${bg}`}
          >
            <input
              type="radio"
              name="quiz-option"
              value={option.id}
              checked={isSelected}
              onChange={() => onOptionSelect(option.id)}
              className="hidden"
            />
            <div className={`w-5 h-5 rounded-full border-2 mr-4 shrink-0 ${circle}`} />
            <span className="text-base text-gray-800 leading-snug">
              <span className="font-semibold text-link mr-2">{option.label}.</span>
              {option.text}
            </span>
          </label>
        );
      })}
    </div>
  );
};
