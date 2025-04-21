import chromadb
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class EmbeddingFunction:
    def __init__(self) -> None:
        self.openai = OpenAI(
            api_key=os.getenv("DEEPINFRA_API_KEY"),
            base_url="https://api.deepinfra.com/v1/openai"
        )
    
    def __call__(self, input_text: str):
        embedding_response = self.openai.embeddings.create(
            model="thenlper/gte-large",
            input=input_text,
            encoding_format="float"
        )
        embedding = embedding_response.data[0].embedding
        return embedding



class ChromaStore:
    def __init__(self) -> None:
        self.client = chromadb.PersistentClient(path="./chroma")
        self.embed_function = EmbeddingFunction()

    def embed_documents(self, texts: list, user_id: str):
        collection = self.client.get_or_create_collection(user_id)
        i = 0
        for text in texts:
            embedding = self.embed_function.__call__(text)
            collection.add(
            ids=[f"{i}" ],
            embeddings=embedding,
            documents=text
            )
            i=i+1
        print("done")
        return None

    def query_documents(self, query_text: str, user_id: str):
        try:
            collection = self.client.get_collection(user_id)

            query_embedding = self.embed_function.__call__(query_text)

            docs = collection.query(
                query_embeddings=[query_embedding], 
                n_results=10
            )
            return docs

        except Exception as e:
            print(f"Error during query: {e}")
            return {"documents": []}
