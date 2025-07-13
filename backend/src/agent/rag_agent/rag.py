""" this module is for the customised rag system """
import json
from typing import List, Optional

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from src.agent.rag_agent.llm_clients import LLMClient
from src.agent.rag_agent.prompts import system_prompt
from src.agent.rag_agent.retrival import RAGRetrival
from src.agent.rag_agent.utils import build_llm_message
from src.agent.rag_agent.workflow import Node, WorkFlow


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

# get the rag retrival
rag_retrival = RAGRetrival()
# get the llm client
llm_client = LLMClient()

app = FastAPI()

def llm_response(state):
    payload = [
        {"role": "system", "content": system_prompt.format(rag_content=state["rag_content"])},
    ]
    payload += state["messages"]
    model = state["user_query"].extra_info.reasoning_model
    return llm_client.generate(payload, model)

@app.post("/invoke")
async def invoke(query: UserQuery):
    """ this is for the user query """
    # reformat the messages
    messages = build_llm_message(query.messages)
    # build up the workflow
    workflow = WorkFlow()
    # add nodes
    workflow.insert(Node(node_fn=rag_retrival.retrive, stage="rag_search"))
    workflow.insert(Node(node_fn=llm_response, stage="finalize_answer"))
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
