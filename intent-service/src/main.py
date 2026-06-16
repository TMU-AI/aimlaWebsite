from fastapi import FastAPI
from pydantic import BaseModel
from vector_demo import resolve

app = FastAPI()

class Query(BaseModel):
    input: str

@app.post("/resolve")
def resolve_endpoint(query: Query):
    return resolve(query.input)

@app.get("/health")
def health_check():
    return {"status": "ok"}