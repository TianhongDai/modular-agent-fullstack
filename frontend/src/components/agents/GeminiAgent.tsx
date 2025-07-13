// this is for the Gemini Agent
import { useEffect, useState } from "react";
import { Brain, Cpu, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// interface for the inputs
interface ExtraInfoParams {
  effort: string;
  model: string;
}

interface EffortSelectorParams {
  effort: string;
  setEffort: (value: string) => void;
}

interface ModelSelectorParams {
  model: string;
  setModel: (value: string) => void;
}

// this func is used to export the state used in the Gemini Agent
const geminiAgentState = () => {
  const [effort, setEffort] = useState("medium");
  const [model, setModel] = useState("gemini-2.5-flash-preview-04-17");
  return { effort, model, setEffort, setModel };
};

// effort selector
const EffortSelctor = ({ effort, setEffort }: EffortSelectorParams) => {
  return (
    <Select value={effort} onValueChange={setEffort}>
      <SelectTrigger className="w-[120px] bg-transparent border-none cursor-pointer">
        <SelectValue placeholder="Effort" />
      </SelectTrigger>
      <SelectContent className="bg-neutral-700 border-neutral-600 text-neutral-300 cursor-pointer">
        <SelectItem
          value="low"
          className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
        >
          Low
        </SelectItem>
        <SelectItem
          value="medium"
          className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
        >
          Medium
        </SelectItem>
        <SelectItem
          value="high"
          className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
        >
          High
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

// model selector
const ModelSelector = ({ model, setModel }: ModelSelectorParams) => {
  return (
    <Select value={model} onValueChange={setModel}>
      <SelectTrigger className="w-[150px] bg-transparent border-none cursor-pointer">
        <SelectValue placeholder="Model" />
      </SelectTrigger>
      <SelectContent className="bg-neutral-700 border-neutral-600 text-neutral-300 cursor-pointer">
        <SelectItem
          value="gemini-2.0-flash"
          className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
        >
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-2 text-yellow-400" /> 2.0 Flash
          </div>
        </SelectItem>
        <SelectItem
          value="gemini-2.5-flash-preview-04-17"
          className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
        >
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-2 text-orange-400" /> 2.5 Flash
          </div>
        </SelectItem>
        <SelectItem
          value="gemini-2.5-pro-preview-05-06"
          className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
        >
          <div className="flex items-center">
            <Cpu className="h-4 w-4 mr-2 text-purple-400" /> 2.5 Pro
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

// event info list
const eventInfo = (data: any) => {
  let titleDetails: string = "";
  let extraInfo;
  // decide the stage
  switch(data.stage) {
    case "generate_query":
      titleDetails = "Generating Search Queries";
      extraInfo = data.extra_info.generate_query.query_list.join(", ");
      break;
    case "web_research":
      titleDetails = "Gathering the Web Resources";
      const sources = data.extra_info.web_research.sources_gathered || [];
      const numSources = sources.length;
      const uniqueLabels = [
        ...new Set(sources.map((s: any) => s.label).filter(Boolean)),
      ];
      const exampleLabels = uniqueLabels.slice(0, 3).join(", ");
      extraInfo =  `Gathered ${numSources} sources. Related to: ${
        exampleLabels || "N/A"
      }.`;
      break;
    case "reflection":
      titleDetails = "Reflection";
      extraInfo = data.extra_info.reflection.is_sufficient
          ? "Search successful, generating final answer."
          : `Need more information, searching for ${data.extra_info.reflection.follow_up_queries?.join(
              ", "
            ) || "additional information"}`;
      break;
    case "finalize_answer":
      titleDetails = "Finalizing the Answers";
      extraInfo = "Composing and presenting the final answer.";
      break;
  }
  return { titleDetails, extraInfo }; 
}; 

const getQueryExtraInfo = ({ effort, model }: ExtraInfoParams) => {
  let initial_search_query_count = 0;
  let max_research_loops = 0;
  const reasoning_model = model;
  switch (effort) {
    case "low":
      initial_search_query_count = 1;
      max_research_loops = 1;
      break;
    case "medium":
      initial_search_query_count = 3;
      max_research_loops = 3;
      break;
    case "high":
      initial_search_query_count = 5;
      max_research_loops = 10;
      break;
  }
  return { initial_search_query_count, max_research_loops, reasoning_model };
};

// build the fields of the agent content
const GeminiAgentFields = ({ onReady }) => {
  // inject states here
  const { effort, setEffort, model, setModel } = geminiAgentState();
  useEffect(() => {
    const extraInfo = getQueryExtraInfo({ effort, model });
    const eventInfoFunc = eventInfo;
    const agentURL = "gemini_agent/invoke";
    onReady(extraInfo, eventInfoFunc, agentURL);
  }, [effort, model]);
  // return the html part
  return (
    <>
      <div className="flex flex-row gap-2 bg-neutral-700 border-neutral-600 text-neutral-300 focus:ring-neutral-500 rounded-xl rounded-t-sm pl-2  max-w-[100%] sm:max-w-[90%]">
        <div className="flex flex-row items-center text-sm">
          <Brain className="h-4 w-4 mr-2" />
          Effort
        </div>
        <EffortSelctor effort={effort} setEffort={setEffort} />
      </div>
      <div className="flex flex-row gap-2 bg-neutral-700 border-neutral-600 text-neutral-300 focus:ring-neutral-500 rounded-xl rounded-t-sm pl-2  max-w-[100%] sm:max-w-[90%]">
        <div className="flex flex-row items-center text-sm ml-2">
          <Cpu className="h-4 w-4 mr-2" />
          Model
        </div>
        <ModelSelector model={model} setModel={setModel} />
      </div>
    </>
  );    
};

export const geminiAgentRegistry = () => {
  return {
    Fields: GeminiAgentFields,
  };
};