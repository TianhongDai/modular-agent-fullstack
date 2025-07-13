import { InputForm } from "./InputForm";
import { SelectedAgentParams } from "@/components/registry/AgentRegistry";

interface WelcomeScreenProps {
  handleSubmit: (
    submittedInputValue: string, 
    selectedAgent: string, 
    eventInfo: (data: any) => any, 
    queryExtraInfo: any,
  ) => void;
  onCancel: () => void;
  isLoading: boolean;
  agentControl: SelectedAgentParams;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  handleSubmit,
  onCancel,
  isLoading,
  agentControl,
}) => (
  <div className="flex flex-col items-center justify-center text-center px-4 flex-1 w-full max-w-3xl mx-auto gap-4">
    <div>
      <h1 className="text-5xl md:text-4xl font-semibold text-neutral-100 mb-3">
        Welcome to Build Your Own Agent.
      </h1>
      <p className="text-xl md:text-2xl text-neutral-400">
        How can I help you today?
      </p>
    </div>
    <div className="w-full mt-4">
      <InputForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={onCancel}
        hasHistory={false}
        agentControl={agentControl}
      />
    </div>
    <p className="text-xs text-neutral-500">
      This project is based on Gemini Fullstack LangGraph Quickstart, now redesigned for LLM-agnostic modular agents.
    </p>
  </div>
);
