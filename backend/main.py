from database import engine,Base
import database_model

Base.metadata.create_all(bind = engine)
