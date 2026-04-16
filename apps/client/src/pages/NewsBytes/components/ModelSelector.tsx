import { LLM_MODELS, LlmModelId } from "../../../dataModel/dataModel";

interface ModelSelectorProps {
  selectedModel: LlmModelId;
  onChange: (model: LlmModelId) => void;
}

export const ModelSelector = ({ selectedModel, onChange }: ModelSelectorProps) => {
  return (
    <select
      className="h-[40px] border border-light-grey rounded-full px-4 font-mono text-sm bg-transparent cursor-pointer transition-[box-shadow,border-color] duration-200 hover:shadow-[0_1px_6px_var(--color-dark-grey)] hover:border-transparent focus:outline-none focus:shadow-[0_1px_6px_var(--color-dark-grey)] focus:border-transparent"
      value={selectedModel}
      onChange={(e) => onChange(e.target.value as LlmModelId)}
      aria-label="Select LLM model"
    >
      {LLM_MODELS.map(({ id, label }) => (
        <option key={id} value={id}>
          {label}
        </option>
      ))}
    </select>
  );
};
