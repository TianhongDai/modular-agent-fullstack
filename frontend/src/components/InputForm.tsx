import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SquarePen, Send, StopCircle, Bot } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { agentRegistry, SelectedAgentParams, AgentType } from "@/components/registry/AgentRegistry";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Updated InputFormProps
interface InputFormProps {
  onSubmit: (inputValue: string, selectedAgent: string, eventInfo: (data: any) => any, extraInfo: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  hasHistory: boolean;
  agentControl: SelectedAgentParams;
}

export const InputForm: React.FC<InputFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  hasHistory,
  agentControl,
}) => {
  // define the agent type
  const [internalInputValue, setInternalInputValue] = useState("");
  const { selectedAgent, setSelectedAgent } = agentControl;
  const [eventInfo, setEventInfo] = useState<() => any>(() => () => ({}));
  const [queryExtraInfo, setQueryExtraInfo] = useState<Record<string, any>>({});
  const [agentURL, setAgentURL] = useState<string>("");
  // agent fields
  const agentEntry = agentRegistry[selectedAgent]();
  const AgentFields = agentEntry.Fields;

  const handleAgentReady = (extraInfo: Record<string, any>, eventFn: () => any, url: string) => {
    setQueryExtraInfo(extraInfo);
    setEventInfo(() => eventFn);
    setAgentURL(url);
  };

  
  const handleInternalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!internalInputValue.trim()) return;
    onSubmit(internalInputValue, agentURL, eventInfo, queryExtraInfo);
    setInternalInputValue("");
  };

  const handleInternalKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleInternalSubmit();
    }
  };

  const isSubmitDisabled = !internalInputValue.trim() || isLoading;

  return (
    <form
      onSubmit={handleInternalSubmit}
      className={`flex flex-col gap-2 p-3 pb-4`}
    >
      <div
        className={`flex flex-row items-center justify-between text-white rounded-3xl rounded-bl-sm ${
          hasHistory ? "rounded-br-sm" : ""
        } break-words min-h-7 bg-neutral-700 px-4 pt-3 `}
      >
        <Textarea
          value={internalInputValue}
          onChange={(e) => setInternalInputValue(e.target.value)}
          onKeyDown={handleInternalKeyDown}
          placeholder="Who won the Euro 2024 and scored the most goals?"
          className={`w-full text-neutral-100 placeholder-neutral-500 resize-none border-0 focus:outline-none focus:ring-0 outline-none focus-visible:ring-0 shadow-none 
                        md:text-base  min-h-[56px] max-h-[200px]`}
          rows={1}
        />
        <div className="-mt-3">
          {isLoading ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 cursor-pointer rounded-full transition-all duration-200"
              onClick={onCancel}
            >
              <StopCircle className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="ghost"
              className={`${
                isSubmitDisabled
                  ? "text-neutral-500"
                  : "text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
              } p-2 cursor-pointer rounded-full transition-all duration-200 text-base`}
              disabled={isSubmitDisabled}
            >
              Search
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-row gap-2">
          {/* this is for the agent system */}
          <div className="flex flex-row gap-2 bg-neutral-700 border-neutral-600 text-neutral-300 focus:ring-neutral-500 rounded-xl rounded-t-sm pl-2  max-w-[100%] sm:max-w-[90%]">
            <div className="flex flex-row items-center text-sm">
              <Bot className="h-4 w-4 mr-2" />
              Agent
            </div>
            <Select value={selectedAgent} onValueChange={(val) => setSelectedAgent(val as AgentType)}>
              <SelectTrigger className="w-[160px] bg-transparent border-none cursor-pointer">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-700 border-neutral-600 text-neutral-300 cursor-pointer">
                {Object.keys(agentRegistry).map((agentName) => (
                  <SelectItem 
                    key={agentName} value={agentName}
                    className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
                  >
                    {agentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AgentFields onReady={handleAgentReady} />
        </div>
        {hasHistory && (
          <Button
            className="bg-neutral-700 border-neutral-600 text-neutral-300 cursor-pointer rounded-xl rounded-t-sm pl-2 "
            variant="default"
            onClick={() => window.location.reload()}
          >
            <SquarePen size={16} />
            New Search
          </Button>
        )}
      </div>
    </form>
  );
};
