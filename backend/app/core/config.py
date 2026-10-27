from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "GreenMetric Predictor"
    app_version: str = "0.1.0"
    
    # Base de datos
    database_url: str
    secret_key: str
    
    # Email
    mail_username: str = ""
    mail_password: str = ""
    mail_from: str = ""
    mail_from_name: str = "Ecocampus"
    mail_port: int = 587
    mail_server: str = "smtp.gmail.com"
    mail_starttls: bool = True
    mail_ssl_tls: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"  # ← Permitir variables no declaradas


@lru_cache()
def get_settings():
    return Settings()