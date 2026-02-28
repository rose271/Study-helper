from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware  # ← add this
from sqlalchemy.orm import Session
from database import get_db, engine, Base
from database_model import User
from pydantic import BaseModel
import database_model

Base.metadata.create_all(bind=engine)

app = FastAPI()

# ── Add this CORS block ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
# ─────────────────────────────────────────────────────────────

class SignupSchema(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

@app.post("/signup")
def signup(user: SignupSchema, db: Session = Depends(get_db)):
    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=user.password
    )
    db.add(new_user)
    db.commit()
    return {"message": "Account created successfully!"}

@app.post("/login")
def login(user: LoginSchema, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or db_user.password != user.password:
        return {"message": "Invalid email or password"}
    return {"message": "Login successful!", "user_id": db_user.user_id}