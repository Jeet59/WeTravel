from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from chromastore import ChromaStore
from openai import OpenAI
from helper import extract_article_details, get_chat_prompt

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

openai = OpenAI(
    api_key="NYJcYs6jfs9JrR0rOBhbdrdHST0mDkPp",
    base_url="https://api.deepinfra.com/v1/openai",
)


class UserInput(BaseModel):
    message: str


class ArticleInput(BaseModel):
    url: str


chroma_store = ChromaStore()


@app.get("/", response_class=HTMLResponse)
async def root():
    with open("static/index.html", encoding="utf-8") as f:
        return f.read()


@app.post("/chat")
async def chat(user_input: UserInput):
    user_message = user_input.message
    try:
        results = chroma_store.query_documents(
            query_text=user_message, user_id="embedding_collection"
        )
        print(results["documents"])
        system_message = get_chat_prompt(results["documents"])
        chat_completion = openai.chat.completions.create(
            model="meta-llama/Llama-3.2-3B-Instruct",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message},
            ],
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
    uvicorn.run(app, host="0.0.0.0", port=8080)
