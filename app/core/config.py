from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "ACME Record Match API"
    app_version: str = "2.1.0"
    default_threshold: int = 88
    cors_origins: str = "http://localhost:3002,http://127.0.0.1:3002"
    log_level: str = "INFO"


settings = Settings()
