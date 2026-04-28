import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

app = FastAPI()


app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


@app.get("/")
def root():
    return {"msg": "welcome to fastapi course"}


@app.get("/tillu/{msg}")
def root(name, msg):
    return {"msg": f"Hello {name} {msg}"}


async def count_generator():
    for i in range(1, 11):
        yield f"chunk {i} of 10\n"
        await asyncio.sleep(0.5)


@app.get("/stream")
async def stream():
    return StreamingResponse(count_generator(), media_type="text/plain")
