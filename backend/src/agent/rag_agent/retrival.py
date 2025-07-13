""" retrival the RAG info in vector database """
import os
from glob import glob

from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.schema import TextNode
from llama_index.core.vector_stores import VectorStoreQuery
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.readers.file import PyMuPDFReader
from llama_index.vector_stores.postgres import PGVectorStore
from sqlalchemy import create_engine, inspect
from structlog import get_logger

# setup the logger
logger = get_logger()

class RAGRetrival:
    def __init__(self):
        """ this is used to retrival the chunks from database """
        # get the embedding
        self.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en")
        # vector store params
        params = {
            "database": os.environ["POSTGRES_DB"],
            "user": os.environ["POSTGRES_USER"],
            "password": os.environ["POSTGRES_PASSWORD"],
            "host": "database",
            "port": "5432",
            "embed_dim": 384,
            "hybrid_search": True,
        }
        self.vector_store = PGVectorStore.from_params(**params)
        if not self._check_table_exists():
            logger.info("start to create the RAG database")
            self._build_rag_database()

    def _check_table_exists(self):
        """ this func is used to detect if the table exists """
        engine = create_engine(os.environ["DATABASE_URL"])
        inspector = inspect(engine)
        return inspector.has_table("data_llamaindex")

    def _build_rag_database(self):
        """ this func is used to build the rag database """
        pdf_paths = glob("/backend/src/agent/rag_agent/data/*.pdf")
        for pdf_path in pdf_paths:
            loader = PyMuPDFReader()
            documents = loader.load(file_path=pdf_path)
            logger.info("start to process PDF file: ", file=pdf_path.split("/")[-1])
            text_parser = SentenceSplitter(chunk_size=1024)
            text_chunks = []
            # maintain relationship with source doc index, to help inject doc metadata in (3)
            doc_idxs = []
            for doc_idx, doc in enumerate(documents):
                cur_text_chunks = text_parser.split_text(doc.text)
                text_chunks.extend(cur_text_chunks)
                doc_idxs.extend([doc_idx] * len(cur_text_chunks))
            nodes = []
            for idx, text_chunk in enumerate(text_chunks):
                node = TextNode(
                    text=text_chunk,
                )
                src_doc = documents[doc_idxs[idx]]
                node.metadata = src_doc.metadata
                nodes.append(node)
            for node in nodes:
                node_embedding = self.embed_model.get_text_embedding(
                    node.get_content(metadata_mode="all")
                )
                node.embedding = node_embedding
            # add these nodes
            self.vector_store.add(nodes)

    def retrive(self, state):
        """ this func is used to retrive the database """
        # get the user query
        query = state["messages"][-1]["content"]
        mode = state["user_query"].extra_info.rag_mode
        query_embedding = self.embed_model.get_query_embedding(query)
        vector_store_query = VectorStoreQuery(
            query_str=query,
            query_embedding=query_embedding,
            similarity_top_k=2,
            mode=mode
        )
        query_result = self.vector_store.query(vector_store_query)
        rag_content = []
        for index, node in enumerate(query_result.nodes):
            rag_content.append(node.get_content())
        state["rag_content"] = rag_content
        return state, "", rag_content
