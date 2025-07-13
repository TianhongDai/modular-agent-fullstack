import { useEffect, useState } from "react";
import { Cpu, Zap, Ghost, NotebookTabs, Binoculars, Waypoints, Bolt } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// interface of the params
interface ExtraInfoParams {
  model: string;
  mode: string;
}

interface ModelSelectorParams {
  model: string;
  setModel: (value: string) => void;
}

interface ModeSelectorParams {
  mode: string;
  setMode: (value: string) => void;
}

// this func is used as the state used in the RAG Agent
const ragAgentState = () => {
  const [model, setModel] = useState("chatgpt-4o-latest");
  const [mode, setMode] = useState("default");
  return { model, setModel, mode, setMode };
};

// model selector
const ModelSelector = ({ model, setModel }: ModelSelectorParams) => {
  return (
    <Select value={model} onValueChange={setModel}>
      <SelectTrigger className="w-[160px] bg-transparent border-none cursor-pointer">
        <SelectValue placeholder="Model" />
      </SelectTrigger>
      <SelectContent className="bg-neutral-700 border-neutral-600 text-neutral-300 cursor-pointer">
        <SelectItem
          value="chatgpt-4o-latest"
          className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
        >
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-2 text-yellow-400" /> ChatGPT-4o
          </div>
        </SelectItem>
        <SelectItem
          value="llama3.1:8b-instruct-q4_K_M"
          className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
        >
          <div className="flex items-center">
            <Ghost className="h-4 w-4 mr-2 text-blue-400" /> Llama-3.1
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

const ModeSelector = ({ mode, setMode }: ModeSelectorParams) => {
  return (
    <Select value={mode} onValueChange={setMode}>
      <SelectTrigger className="w-[130px] bg-transparent border-none cursor-pointer">
        <SelectValue placeholder="Mode" />
      </SelectTrigger>
      <SelectContent className="bg-neutral-700 border-neutral-600 text-neutral-300 cursor-pointer">
        <SelectItem
          value="default"
          className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
        >
          <div className="flex items-center">
            <Binoculars className="h-4 w-4 mr-2 text-green-400" /> Default
          </div>
        </SelectItem>
        <SelectItem
          value="hybrid"
          className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
        >
          <div className="flex items-center">
            <Bolt className="h-4 w-4 mr-2 text-red-400" /> Hybrid
          </div>
        </SelectItem>
        <SelectItem
          value="sparse"
          className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
        >
          <div className="flex items-center">
            <Waypoints className="h-4 w-4 mr-2 text-blue-400" /> Sparse
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
    case "finalize_answer":
      titleDetails = "Finalizing the Answers";
      extraInfo = "Composing and presenting the final answer.";
      break;
    case "rag_search":
      const chunks = data.extra_info || [];
      const numChunks = chunks.length;
      titleDetails = "Search Knowledge Base Using RAG";
      extraInfo = `Gathered ${numChunks} chunks from RAG Database.`;
      break;
  }
  return { titleDetails, extraInfo }; 
}; 

const getQueryExtraInfo = ({ model, mode }: ExtraInfoParams) => {
  const reasoning_model = model;
  const rag_mode = mode;
  return { reasoning_model, rag_mode };
};

// build the fields of the agent content
const RAGAgentFields = ({ onReady }) => {
  const { model, setModel, mode, setMode } = ragAgentState();
  useEffect(() => {
    const extraInfo = getQueryExtraInfo({ model, mode });
    const eventInfoFunc = eventInfo;
    const agentURL = "rag_agent/invoke";
    onReady(extraInfo, eventInfoFunc, agentURL);
  }, [ model, mode]);
  return (
    <>
      <div className="flex flex-row gap-2 bg-neutral-700 border-neutral-600 text-neutral-300 focus:ring-neutral-500 rounded-xl rounded-t-sm pl-2  max-w-[100%] sm:max-w-[90%]">
        <div className="flex flex-row items-center text-sm ml-2">
          <Cpu className="h-4 w-4 mr-2" />
          Model
        </div>
        <ModelSelector model={model} setModel={setModel} />
      </div>
      <div className="flex flex-row gap-2 bg-neutral-700 border-neutral-600 text-neutral-300 focus:ring-neutral-500 rounded-xl rounded-t-sm pl-2  max-w-[100%] sm:max-w-[90%]">
        <div className="flex flex-row items-center text-sm ml-2">
          <NotebookTabs className="h-4 w-4 mr-2" />
          Mode
        </div>
        <ModeSelector mode={mode} setMode={setMode} />
      </div>
    </>
  );    
};

// agent registry
export const ragAgentRegistry = () => {
  return {
    Fields: RAGAgentFields,
  };
};