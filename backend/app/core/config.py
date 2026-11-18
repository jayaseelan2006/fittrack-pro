from functools import lru_cache
from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "FitTrack Pro"
    APP_ENV: str = "development"

    MYSQL_DATABASE: str = "fittrack"
    MYSQL_USER: str = "fittrack_user"
    MYSQL_PASSWORD: str = ""
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    # Optional full override (used by tests, e.g. sqlite:///:memory:)
    DATABASE_URL: str | None = None

    SECRET_KEY: str = "dev-only-insecure-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    RESET_TOKEN_EXPIRE_MINUTES: int = 30

    CORS_ORIGINS: str = "http://localhost:5173"
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_MB: int = 5

    @computed_field
    @property
    def sqlalchemy_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.MYSQL_DATABASE}?charset=utf8mb4"
        )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
