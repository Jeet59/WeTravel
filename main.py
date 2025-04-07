from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from chromastore import ChromaStore
from openai import OpenAI
from helper import extract_article_details, get_chat_prompt
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# Get API key from environment variable
openai = OpenAI(
    api_key=os.getenv("DEEPINFRA_API_KEY"),
    base_url="https://api.deepinfra.com/v1/openai",
)

# Store Google Maps API key for use in templates
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")


class UserInput(BaseModel):
    message: str
    history: list = []


class ArticleInput(BaseModel):
    url: str


class LoginInput(BaseModel):
    email: str
    password: str


class SignupInput(BaseModel):
    name: str
    email: str
    password: str


chroma_store = ChromaStore()


@app.get("/", response_class=HTMLResponse)
async def root():
    # Serve login page as the landing page
    with open("static/auth.html", encoding="utf-8") as f:
        return f.read()


@app.get("/app", response_class=HTMLResponse)
async def app_page():
    # Serve the main app page
    with open("static/index.html", encoding="utf-8") as f:
        content = f.read()
        # Replace placeholder with actual API key
        content = content.replace("YOUR_GOOGLE_MAPS_API_KEY", GOOGLE_MAPS_API_KEY)
        return content


@app.post("/api/login")
async def login(login_input: LoginInput):
    # In a real application, you would validate credentials against a database
    # For demo purposes, we'll accept a hardcoded user
    if login_input.email == "demo@example.com" and login_input.password == "password":
        return {"success": True, "name": "Demo User", "email": login_input.email}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@app.post("/api/signup")
async def signup(signup_input: SignupInput):
    # In a real application, you would store the user in a database
    # For demo purposes, we'll just return success
    return {
        "success": True,
        "name": signup_input.name,
        "email": signup_input.email
    }


@app.post("/chat")
async def chat(user_input: UserInput):
    user_message = user_input.message
    chat_history = user_input.history
    
    try:
        # Query for relevant documents
        results = chroma_store.query_documents(
            query_text=user_message, user_id="embedding_collection"
        )
        print(results["documents"])
        
        # Get system prompt with context
        system_message = get_chat_prompt(results["documents"])
        
        # Prepare messages for the API
        messages = [{"role": "system", "content": system_message}]
        
        # Add chat history to messages (limited to last 10 messages for context window considerations)
        if chat_history:
            for msg in chat_history[-10:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        # If the most recent message is not the current user message, add it
        if not chat_history or chat_history[-1]["content"] != user_message:
            messages.append({"role": "user", "content": user_message})
        
        # Call the LLM with the full conversation context
        chat_completion = openai.chat.completions.create(
            model="meta-llama/Llama-3.2-3B-Instruct",
            messages=messages,
            stream=False,
        )
        
        return chat_completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/extract")
async def extract(article_input: ArticleInput):
    url = article_input.url
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    extracted_content = extract_article_details(url)
    try:
        chroma_store.embed_documents(
            texts=extracted_content, user_id="embedding_collection"
        )
        return {"url": url, "content": str(extracted_content)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
