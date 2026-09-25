from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Airbnb Clone API"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite:///./airbnb.db"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    SERVICE_FEE_PERCENTAGE: float = 0.14
    DEFAULT_PAGE_SIZE: int = 12

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
