from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = 'users'

    user_id     = Column(Integer, primary_key=True, autoincrement=True)
    first_name  = Column(String(50), nullable=False)
    last_name   = Column(String(50), nullable=False)
    email       = Column(String(255), unique=True, nullable=False)
    password    = Column(String(255), nullable=False)
    create_date = Column(DateTime, default=datetime.now)


class Folder(Base):
    __tablename__= 'folder'

    folder_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'),nullable=False)
    folder_name = Column(String(50),nullable=False)
    folder_des = Column(String(250))
    create_date = Column(DateTime, default=datetime.now)

class contentoffolder(Base):
    __tablename__='Folder_Content'

    content_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'),nullable=False)
    folder_id =Column(Integer, ForeignKey('folder.folder_id'),nullable=False)
    content_name= Column(String(50),nullable=False)
    content_path = Column(String(500), nullable=False)
    create_date = Column(DateTime, default=datetime.now)

   