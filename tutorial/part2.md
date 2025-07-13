# Customised Frontend UI
This section explains how to create a customised frontend interface for your agent. Don’t worry if you’re unfamiliar with TypeScript or frontend development - just follow the templates we provide, and you’ll be able to integrate your own agent UI easily.

## Frontend Structure
```text
frontend/
├── src/
│   ├── components/ 
│       ├── agents/ 
│       │   ├── GeminiAgent.tsx
│       │   └── RAGAgent.tsx
│       ├── registry/
│           └── AgentRegistry.tsx
│
...
```
The frontend consists of two key components for supporting agents:
- `frontend/src/agent`: Contains the UI logic for each individual agent.
- `backend/src/registry/AgentRegistry.tsx`: Maintains a registry of all available agents.

## Create a Custom Agent UI Component
We’ll use the RAG Agent as an example. The implementation can be found in `RAGAgent.tsx`.

### Define Interfaces and State Variables
In the RAG Agent, certain values like the LLM `model` and `retrieve_mode` - need to be passed to the backend. Like Pydantic in Python, we define TypeScript interfaces to validate and manage these inputs as state variables.
```typescript
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

const ragAgentState = () => {
  const [model, setModel] = useState("chatgpt-4o-latest");
  const [mode, setMode] = useState("default");
  return { model, setModel, mode, setMode };
};
```

### Create the UI for Custom Parameters
Here’s an example component for selecting the LLM model. This allows users to choose between different models like `ChatGPT-4o` and `Llama-3.1`.
```typescript
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

// get the extra info
const getQueryExtraInfo = ({ model, mode }: ExtraInfoParams) => {
  const reasoning_model = model;
  const rag_mode = mode;
  return { reasoning_model, rag_mode };
};
```
Modify this component to fit the parameters used by your agent.

### Handle Backend Streaming Events
To reflect each stage of the backend agent in the UI, define how stage info and metadata should be interpreted. You can customize titles and descriptions for each stage. Moreover, the `extraInfo` can be processed in the backend in the backend to simplify the logic on the frontend.
```typescript
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
```
Update this function to reflect your agent’s unique stages and metadata.

### Assemble the Full Agent Component
Now bring everything together into a complete component:
```typescript
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
```
### Register the Agent
Lastly, update the `AgentRegistry.tsx` to include your new agent:
```typescript
// this is the agent registry
export const agentRegistry = {
  "Gemini Agent": geminiAgentRegistry,
  "RAG Agent": ragAgentRegistry, // add tge agent with its name here
};
```
Once registered, the agent will be selectable from the UI and ready to handle user queries using its unique interface and backend logic.

