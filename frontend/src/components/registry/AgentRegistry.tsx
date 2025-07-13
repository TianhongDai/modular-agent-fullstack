import { geminiAgentRegistry } from "@/components/agents/GeminiAgent";
import { ragAgentRegistry } from "@/components/agents/RAGAgent";
import { useState } from "react";

// this is the agent registry
export const agentRegistry = {
  "Gemini Agent": geminiAgentRegistry,
  "RAG Agent": ragAgentRegistry,
};

// this is the agent lists
export type AgentType = keyof typeof agentRegistry;

export interface SelectedAgentParams {
  selectedAgent: AgentType;
  setSelectedAgent: (value: AgentType) => void;
}

// selected agent states
export const getSelectedAgentState = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentType>("Gemini Agent");
  return { selectedAgent, setSelectedAgent };
};