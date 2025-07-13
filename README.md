# Modular Agent Fullstack
Modular Agent Fullstack is an extended and improved version of the "[Gemini Fullstack LangGraph Quickstart](https://github.com/google-gemini/gemini-fullstack-langgraph-quickstart)" project by the Google Gemini Team. While the original project offers a great introduction to building fullstack AI agents using LangGraph, it also comes with several limitations that can hinder beginners and AI enthusiasts from further exploration, customization, or learning.

This project addresses those limitations by refactoring the codebase into a more modular framework, making it easier to extend, customize, develop, and deploy AI agents with your preferred UI and backend architecture.

<div style="display: flex; justify-content: center; gap: 5px;">
  <img src="assets/select-agent.png" width="49%" />
  <img src="assets/rag-ui.png" width="49%" />
</div>

## Limitaions of Gemini's Fullstack LangGrapgh Project
- **Heavy Dependence on LangGraph**: The original project relies extensively on LangGraph, not just for building the agent, but also for serving frontend components and powering the backend API server. This hides important implementation details and reduces flexibility for developers who prefer to use their own methods for frontend/backend integration.
- **Difficult to Extend with Custom Agents**: The current frontend design is rigid and doesn’t support adding custom agents easily, for example, creating custom dashboards for workflow visualization or adding configurable parameter inputs.
- **Limited to Gemini**
- **Cumbersome Development and Deployment**: Although Docker is used, the setup lacks a dedicated development environment and does not offer a clear or feasible deployment strategy - for example, hosting the project on a public URL is not straightforward.

## Improvements in Modular Agent Fullstack
- **Reduced LangGraph Dependency**: LangGraph dependencies `@langchain/langgraph-sdk` have been removed from the frontend. The backend and Docker configuration have been modified to eliminate dependence on `langchain-dev` as the API server, giving you more control and transparency.
- **Modular Agent Architecture**: The project is refactored to support modular agent extensions in both the frontend and backend. You can now plug in your own custom agents and UI components easily and cleanly.
- **Support for Any LLM Provider**: The system is designed to be model-agnostic, which means you can use OpenAI, Gemini, Claude, or any other LLM API with minimal changes.  In addition, it includes support for running models locally using Ollama.
- **Optimized for Development and Deployment**: Fully Dockerized environments for both development and production are provided. You can develop inside containers with ease and deploy the application via a public URL using tools like *Ngrok* or *Cloudflare Tunnel*.

## Overview of Structure
<div style="text-align: center;">
  <img src="assets/structure.svg" width="85%" />
</div>


## Getting Started & Tutorials
### Pre-requisite
Before you begin, ensure that Docker is installed on your machine. Docker significantly simplifies the development and deployment process. For installation instructions, please refer to the official [Docker](https://www.docker.com/) website.
### Configure the Env Variables
1. Create your `.env` file from the provided example:
```bash
cp .env.example .env
```
2. Open the `.env` file and replace the placeholders with your actual API keys and configuration values:
```shell
# database related params
POSTGRES_DB=rag
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@database/rag
# api-tokens
OPENAI_API_KEY=<openai-api-key> # replace with your api-key if necessary
GEMINI_API_KEY=<gemini-api-key> # replace with your api-key if necessary
# ollama url
OLLAMA_URL=http://host.docker.internal:11434 # replace with None if ollama is not used
# python buffer
PYTHONUNBUFFERED=1
```
### Add a PDF File for RAG Agent
To enable the RAG agent to initialize its vector database, place a PDF file inside the following folder: `backend/src/agent/rag_agent/data`. The PDF content will be indexed and used by the agent to perform retrieval-augmented generation. In this example, we used the [London Visitor Guide](https://content.tfl.gov.uk/london-visitor-guide.pdf) provided by Transport for London (TfL).

### Self-Host LLM with Ollama
If you’re running Ollama on your local host machine, make sure to set the following in your `.env` file:
```shell
OLLAMA_URL=http://host.docker.internal:11434
```
This ensures that the Docker container can communicate with the Ollama server running outside the container. 

Additionally, ensure the required LLM model is available by pulling it with the following command:
```bash
ollama pull llama3.1:8b-instruct-q4_K_M
```

### Development Mode
This mode enables live code editing with hot reloading for both the frontend and backend.
1. Build and start the containers using `docker-compose.dev.yml`:
```bash
docker-compose -f docker-compose.dev.yml up --build
```
>On Linux, you may need to prefix the command with `sudo` if your user isn’t part of the Docker group.
2. Open your browser and visit: [http://localhost:8080](http://localhost:8080).
3. Make changes directly in the source code. Both the frontend and backend will automatically reload to reflect your updates in real time.

### Deployment Mode
This mode is optimized for production deployment.
1. Build and start the containers using `docker-compose.yml`:
```bash
docker-compose -f docker-compose.yml up --build
```
>On Linux, use `sudo` if required.
2. Access the application via: [http://localhost:8080](http://localhost:8080).
3. To make your deployment publicly accessible, you can expose the port using tools like *Ngrok* or *Cloudflare Tunnel*.

## Tutorial to Extend Customised Agent
- Part 1: [Build Up a Customised Agent - Backend](tutorial/part1.md)
- Part 2: [Customised Frontend UI - Frontend](tutorial/part2.md)

## Acknowledgement
- [Gemini Fullstack LangGraph Quickstart](https://github.com/google-gemini/gemini-fullstack-langgraph-quickstart)
- ChatGPT - for assisting in fine-tuning the documentation.