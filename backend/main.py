from fastapi import FastAPI, Depends, HTTPException  
from fastapi.middleware.cors import CORSMiddleware  # ← add this
from sqlalchemy.orm import Session
from database import get_db, engine, Base
from database_model import User, Folder, contentoffolder
from pydantic import BaseModel
import database_model
import os, shutil
from fastapi import File, UploadFile
from fastapi.staticfiles import StaticFiles
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

class FolderSchema(BaseModel):
    folder_name: str
    folder_des: str

class FolderEditSchema(BaseModel):
    folder_name: str
    folder_des: str
class foldercontent(BaseModel):
    content_name:str
    content_path:str

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


# Create folder
@app.post("/folders/{user_id}")
def create_folder(user_id: int, folder: FolderSchema, db: Session = Depends(get_db)):
    new_folder = Folder(
        user_id=user_id,
        folder_name=folder.folder_name,
        folder_des=folder.folder_des
    )
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)
    return {"message": "Folder created!", "folder_id": new_folder.folder_id}


# Get all folders for a user
@app.get("/folders/{user_id}")
def get_folders(user_id: int, db: Session = Depends(get_db)):
    folders = db.query(Folder).filter(Folder.user_id == user_id).all()
    return folders

# Edit folder
@app.put("/folder/{folder_id}")
def edit_folder(folder_id: int, folder: FolderEditSchema, db: Session = Depends(get_db)):
    db_folder = db.query(Folder).filter(Folder.folder_id == folder_id).first()
    if not db_folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    db_folder.folder_name = folder.folder_name
    db_folder.folder_des  = folder.folder_des
    db.commit()
    return {"message": "Folder updated!"}


# ── Serve uploaded files as static files ──────────────────
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Get folder info ────────────────────────────────────────
@app.get("/folder/info/{folder_id}")
def get_folder_info(folder_id: int, db: Session = Depends(get_db)):
    folder = db.query(Folder).filter(Folder.folder_id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder

# ── Upload file ────────────────────────────────────────────
@app.post("/contents/{user_id}/{folder_id}")
async def upload_content(user_id: int, folder_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_path = f"{UPLOAD_DIR}/{folder_id}_{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    new_content = contentoffolder(      # ← changed
        user_id      = user_id,
        folder_id    = folder_id,
        content_name = file.filename,
        content_path = file_path
    )
    db.add(new_content)
    db.commit()
    return {"message": "File uploaded!"}

# ── Get all files in a folder ──────────────────────────────
@app.get("/contents/{folder_id}")
def get_contents(folder_id: int, db: Session = Depends(get_db)):
    contents = db.query(contentoffolder).filter(contentoffolder.folder_id == folder_id).all()  # ← changed
    return contents

# ── Delete a file ──────────────────────────────────────────
@app.delete("/contents/{content_id}")
def delete_content(content_id: int, db: Session = Depends(get_db)):
    content = db.query(contentoffolder).filter(contentoffolder.content_id == content_id).first()  # ← changed
    if not content:
        raise HTTPException(status_code=404, detail="File not found")
    if os.path.exists(content.content_path):
        os.remove(content.content_path)
    db.delete(content)
    db.commit()
    return {"message": "File deleted!"}