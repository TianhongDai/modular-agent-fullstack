# Build A Customised Agent
This section introduces how to create a custom agent within the Modular Agent Fullstack framework. We’ll walk through the backend structure, explain how to build a new agent step by step, and demonstrate streaming info to the frontend.
## Backend Structure
```text
backend/
├── src/
│   ├── agent/ 
│   │   ├── gemini_agent/ 
│   │   ├── rag_agent/
│   └── app.py 
│
├── .gitignore 
├── Dockerfile 
├── requirements.txt 
```
The backend is structured around two key components for extending agents:
- `backend/src/agent`: Contains the core logic of each individual agent.
- `backend/src/app.py`: The main entry point for the FastAPI application where agents are mounted.
## Creating a Custom Agent
Each agent runs as a separate FastAPI sub-application and is mounted in app.py. We’ll use the RAG agent as an example to illustrate how to build a custom agent. Below we highlight only the core components that refer to the actual codebase for full implementation details.

### Define a Basic Endpoint
To allow interaction between the frontend and backend, each agent must expose an endpoint to handle user queries. Here’s a basic structure:
```python
@app.post("/invoke")
async def invoke(query: UserQuery):
    """
    the agent logic to process the user's query and provide the 
    corresponding response
    """
    raise NotImplementedError
```
We use a shared input format across all agents to keep the framework consistent. The input is validated using **Pydantic**:
```python
class Message(BaseModel):
    type: str
    content: str
    id: str

class ExtraInfo(BaseModel):
    reasoning_model: Optional[str] = "chatgpt-4o-latest"
    rag_mode: Optional[str] = "default"

class UserQuery(BaseModel):
    messages: List[Message]
    extra_info: ExtraInfo
```
Each user input `UserQuery` contains:
- **messages**: A list of prior messages from both the user and AI.
  - **type**: It can be either `ai` or `human`, which indicates if this message from the user or the LLM.
  - **content**: It's the text of the message.
  - **id**: It's the ID of the message.
- **extra_info**: Optional parameters. In the RAG agent, it provides:
  - `reasoning_model`: the LLM model name used for generating the response.
  - `rag_mode`: the retrieval mode, it can be `default | sparse | hybrid`.

### Define the Workflow
This step defines the workflow of the customised agent system. To clearly represent each stage in the RAG pipeline, we use a linked list structure to describe the workflow. Each node corresponds to a specific step in the process. The complete implementation can be found in `rag_agent/workflow.py`.
```python
class Node:
    def __init__(self, node_fn, stage):
        self.node_fn = node_fn
        self.stage = stage
        self.next = None

class WorkFlow:
    def __init__(self):
        self.head = None

    def insert(self, node):
        """ this func is used to insert the node """
        if self.head is None:
            self.head = node
            return
        cur_node = self.head
        while cur_node.next:
            cur_node = cur_node.next
        cur_node.next = node
    
    def __iter__(self):
        cur_node = self.head
        while cur_node:
            yield cur_node
            cur_node = cur_node.next
```
Here, `self.stage` defines the name of the current step in the workflow (e.g., retrieving chunks from the vector database), and `self.node_fn` specifies the function to be executed at that stage. Each node is then linked together using a linked list structure to form the complete workflow.
>Of course, a graph is a more flexible data structure compared to a linked list - this is also the approach used by LangGraph. The linked list in this example is meant to keep things simple, but you’re encouraged to use more advanced or appropriate data structures based on the complexity and needs of your own agent design.

### Create the Workflow
Below is a simple example demonstrating how to construct a workflow by adding two basic nodes in a RAG system.
```python
# build up the workflow
workflow = WorkFlow()
# add nodes
workflow.insert(Node(node_fn=rag_retrival.retrive, stage="rag_search"))
workflow.insert(Node(node_fn=llm_response, stage="finalize_answer"))
```
>The final node must be named `finalize_answer` so the frontend can identify and display the agent’s final output correctly.

### Stream Responses to the Frontend
To dynamically display the stage information of the agent system, it’s recommended to use a streaming response to send data to the frontend in real time. To achieve this, we provide example implementations in both the Gemini Agent and RAG Agent.
```python
@app.post("/invoke")
async def invoke(query: UserQuery):
    # ...
    state = {"messages": messages, "user_query": query}
    async def stream(state):
        for _node in workflow:
            if _node.stage == "finalize_answer":
                async for content in _node.node_fn(state):
                    res = {"stage": _node.stage, "response": content}
                    yield json.dumps(res) + "\n"
            else:
                state, content, extra_info = _node.node_fn(state)
                res = {"stage": _node.stage, "response": content, "extra_info": extra_info}
                yield json.dumps(res) + "\n"
    return StreamingResponse(stream(state))
```
When streaming the output, there are three key components included in each response:
- **stage**: Indicates the current step in the agent’s workflow (e.g., retrieval, generation).
- **response**: The final answer intended for the user, which is only included during the `finalize_answer` stage.
- **extra_info**:  Contains detailed metadata about the stage, such as the number of retrieved chunks from the vector database.

A separate step is used specifically for handling the `finalize_answer` stage because it streams the final output to the frontend. Currently, only streaming responses are supported for this step, but support for non-streamed responses may be added in the future.

### Mount the Endpoint
Finally, register your custom agent by mounting its FastAPI application in the main entry point (`backend/src/app.py`):
```python
# mount the app
app.mount("/gemini_agent", gemini_agent_app)
app.mount("/rag_agent", rag_agent_app)
```