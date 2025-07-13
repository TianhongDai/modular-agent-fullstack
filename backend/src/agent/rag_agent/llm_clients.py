""" this module is used to define the llm clients, include OpenAI-based and Ollama based """
import json
import os

import structlog
from ollama import AsyncClient
from openai import AsyncOpenAI

# get the logger
logger = structlog.get_logger()

class LLMClient:
    def __init__(self):
        # define the ollama and openai client
        self.ollama_client = AsyncClient(host=os.environ["OLLAMA_URL"])
        self.openai_client = AsyncOpenAI()

    async def _ollama_gen(self, payload, model="llama3.1:8b-instruct-q4_K_M"):
        """ generate the response from ollama """
        try:
            res = await self.ollama_client.chat(model=model, messages=payload, stream=True)
            async for event in res:
                if not event["done"]:
                    yield event["message"]["content"]
        except Exception as e:
            logger.error("ollama client has error: ", error=e)

    async def _openai_gen(self, payload, model="chatgpt-4o-latest"):
        try:
            """ generate the response from openai """
            res = await self.openai_client.responses.create(model=model, input=payload, stream=True)
            async for event in res:
                _event = json.loads(event.to_json())
                if "delta" in _event:
                    yield _event["delta"]
        except Exception as e:
            logger.error("openai client has error: ", error=e)

    def generate(self, payload, model):
        """ this func is used to generate the response """
        if model == "chatgpt-4o-latest":
            return self._openai_gen(payload, model)
        else:
            return self._ollama_gen(payload, model)
