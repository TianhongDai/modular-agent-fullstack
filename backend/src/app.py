from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.agent.gemini_agent.graph import app as gemini_agent_app
from src.agent.rag_agent.rag import app as rag_agent_app

# Define the FastAPI app
app = FastAPI()

# add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount the app
app.mount("/gemini_agent", gemini_agent_app)
app.mount("/rag_agent", rag_agent_app)
