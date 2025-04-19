from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from chromastore import ChromaStore
from openai import OpenAI
from helper import extract_article_details, get_chat_prompt
import os
from dotenv import load_dotenv
import httpx
from typing import Optional, List
import json

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

# Constants for Unsplash API
UNSPLASH_API_URL = "https://api.unsplash.com/photos/random"
UNSPLASH_ACCESS_KEY = "axfyxtGBmNUo_ufK-tMD1qQ1kZi7CwUG3qwd-5tHL0M"


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
        # Minimal fallback response in case of API issues
        fallback_response = {"response": "I'm sorry, I'm having trouble processing your request right now. Please try again later."}
        
        # Log incoming message for debugging
        print(f"Received message: {user_message}")
        
        # Add some basic error handling for empty messages
        if not user_message or user_message.strip() == "":
            return {"response": "I didn't receive a message. Can you please try again?"}
        
        # Query for relevant documents
        try:
            results = chroma_store.query_documents(
                query_text=user_message, user_id="embedding_collection"
            )
            print(f"Document results: {len(results['documents'] if 'documents' in results else [])}")
        except Exception as doc_error:
            print(f"Error querying documents: {str(doc_error)}")
            results = {"documents": []}
        
        # Get system prompt with context
        system_message = get_chat_prompt(results.get("documents", []))
        
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
        try:
            # Set a timeout for the API call
            chat_completion = openai.chat.completions.create(
                model="meta-llama/Llama-3.2-3B-Instruct",
                messages=messages,
                stream=False,
                timeout=15  # 15 second timeout
            )
            
            # Extract the response content from the completion
            if chat_completion and hasattr(chat_completion, 'choices') and len(chat_completion.choices) > 0:
                response_content = chat_completion.choices[0].message.content
                print(f"Response generated: {response_content[:50]}...")  # Log first 50 chars
                return {"response": response_content}
            else:
                print("Empty or invalid completion response")
                return fallback_response
                
        except Exception as api_error:
            # Handle specific API errors
            print(f"API error: {str(api_error)}")
            # Provide more specific error messages based on common API issues
            if "timeout" in str(api_error).lower():
                return {"response": "I'm taking too long to respond. Let me try with a simpler answer. Can you ask me again?"}
            elif "rate limit" in str(api_error).lower():
                return {"response": "I'm currently handling too many requests. Please try again in a moment."}
            else:
                return fallback_response
            
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return {"response": "Something went wrong with our conversation. Let's start again."}


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


@app.get("/api/unsplash/random")
async def get_unsplash_random(
    collections: Optional[str] = None,
    topics: Optional[str] = None,
    username: Optional[str] = None,
    query: Optional[str] = None,
    orientation: Optional[str] = None,
    content_filter: Optional[str] = "low",
    count: Optional[int] = 1
):
    """
    Fetch random images from Unsplash API.
    
    Parameters:
    - collections: Public collection ID(s), comma-separated
    - topics: Public topic ID(s), comma-separated
    - username: Limit selection to a single user's photos
    - query: Search term for filtering photos
    - orientation: landscape, portrait, or squarish
    - content_filter: low or high (default: low)
    - count: Number of photos to return (default: 1, max: 30)
    """
    # Validate parameters
    if orientation and orientation not in ["landscape", "portrait", "squarish"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid orientation. Must be 'landscape', 'portrait', or 'squarish'."
        )
    
    if content_filter and content_filter not in ["low", "high"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid content_filter. Must be 'low' or 'high'."
        )
    
    if count and (count < 1 or count > 30):
        raise HTTPException(
            status_code=400, 
            detail="Invalid count. Must be between 1 and 30."
        )
    
    # Prepare query parameters
    params = {}
    if collections:
        params["collections"] = collections
    if topics:
        params["topics"] = topics
    if username:
        params["username"] = username
    if query:
        params["query"] = query
    if orientation:
        params["orientation"] = orientation
    if content_filter:
        params["content_filter"] = content_filter
    if count:
        params["count"] = count
    
    # Prepare headers with authentication
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                UNSPLASH_API_URL,
                params=params,
                headers=headers,
                timeout=10.0  # 10 seconds timeout
            )
            
            # Check for errors
            response.raise_for_status()
            
            # Parse response
            data = response.json()
            
            # Extract relevant information
            if count == 1 and not isinstance(data, list):
                # Single image response
                result = {
                    "success": True,
                    "images": [{
                        "id": data.get("id"),
                        "url": data.get("urls", {}).get("regular"),
                        "thumb": data.get("urls", {}).get("thumb"),
                        "full": data.get("urls", {}).get("full"),
                        "download": data.get("links", {}).get("download"),
                        "description": data.get("description"),
                        "alt_description": data.get("alt_description"),
                        "user": {
                            "name": data.get("user", {}).get("name"),
                            "username": data.get("user", {}).get("username"),
                            "portfolio_url": data.get("user", {}).get("portfolio_url"),
                        },
                        "location": data.get("location"),
                    }]
                }
            else:
                # Multiple images response
                result = {
                    "success": True,
                    "images": [
                        {
                            "id": img.get("id"),
                            "url": img.get("urls", {}).get("regular"),
                            "thumb": img.get("urls", {}).get("thumb"),
                            "full": img.get("urls", {}).get("full"),
                            "download": img.get("links", {}).get("download"),
                            "description": img.get("description"),
                            "alt_description": img.get("alt_description"),
                            "user": {
                                "name": img.get("user", {}).get("name"),
                                "username": img.get("user", {}).get("username"),
                                "portfolio_url": img.get("user", {}).get("portfolio_url"),
                            },
                            "location": img.get("location"),
                        }
                        for img in data
                    ]
                }
            
            # Include rate limit information if available
            if "X-Ratelimit-Remaining" in response.headers:
                result["rate_limit"] = {
                    "remaining": response.headers.get("X-Ratelimit-Remaining"),
                    "total": response.headers.get("X-Ratelimit-Limit"),
                }
            
            return result
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Request to Unsplash API timed out"
        )
    except httpx.HTTPStatusError as e:
        # Handle specific API errors
        status_code = e.response.status_code
        try:
            error_data = e.response.json()
            error_message = error_data.get("errors", ["Unknown error"])[0]
        except:
            error_message = str(e)
        
        raise HTTPException(
            status_code=status_code,
            detail=f"Unsplash API error: {error_message}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
