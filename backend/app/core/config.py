from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "GreenMetric Predictor"
    app_version: str = "0.1.0"
    database_url: str
    secret_key: str

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()