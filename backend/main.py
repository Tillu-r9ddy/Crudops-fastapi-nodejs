import asyncio
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator
from sqlalchemy import Boolean, Column, DateTime, Integer, String, create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# ---------------------------------------------------------------------------
# Database setup — shared tasks.db at project root (absolute path, Windows-safe)
# ---------------------------------------------------------------------------

_DB_PATH = Path(__file__).parent.parent / "tasks.db"
DATABASE_URL = f"sqlite:///{_DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# WAL mode allows both FastAPI and Node.js to read/write the same file safely
@event.listens_for(engine, "connect")
def set_wal_mode(dbapi_conn, _):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class TaskModel(Base):
    __tablename__ = "tasks"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    description = Column(String, default="")
    completed   = Column(Boolean, default=False)
    created_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))


Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class TaskCreate(BaseModel):
    title: str
    description: str = ""


class TaskUpdate(BaseModel):
    title:       Optional[str]  = None
    description: Optional[str]  = None
    completed:   Optional[bool] = None


class TaskOut(BaseModel):
    id:          int
    title:       str
    description: str = ""
    completed:   bool = False
    created_at:  Optional[datetime] = None

    @field_validator("completed", mode="before")
    @classmethod
    def coerce_completed(cls, v):
        return bool(v) if v is not None else False

    model_config = {"from_attributes": True}

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="CrudOps — FastAPI")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {"msg": "CrudOps FastAPI is running"}


@app.get("/tillu")
def tillu():
    return {"msg": "Hello tilak from FastAPI!"}


@app.get("/tasks", response_model=list[TaskOut])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(TaskModel).order_by(TaskModel.created_at.desc()).all()


@app.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(body: TaskCreate, db: Session = Depends(get_db)):
    task = TaskModel(**body.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, body: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()


# ---------------------------------------------------------------------------
# Streaming demo (kept for learning — shows async generators)
# ---------------------------------------------------------------------------

async def count_generator():
    for i in range(1, 11):
        yield f"chunk {i} of 10\n"
        await asyncio.sleep(0.5)


@app.get("/stream")
async def stream():
    return StreamingResponse(count_generator(), media_type="text/plain")
