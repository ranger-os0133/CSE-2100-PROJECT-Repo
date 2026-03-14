from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AliasChoices, Field

class Settings(BaseSettings):
	model_config = SettingsConfigDict(env_file=".env", extra="ignore")

	app_name: str = Field(default="Nebula")
	debug: bool = Field(default=True)

	database_url: str | None = Field(
		default=None,
		validation_alias=AliasChoices("DATABASE_URL", "database_url"),
	)
	jwt_secret_key: str = Field(default="changeme", alias="JWT_SECRET_KEY")
	jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
	jwt_access_token_expire_minutes: int = Field(default=60, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
	jwt_refresh_token_expire_days: int = Field(default=7, alias="JWT_REFRESH_TOKEN_EXPIRE_DAYS")



	imagekit_public_key: str | None = Field(default=None, alias="IMAGEKIT_PUBLIC_KEY")
	imagekit_private_key: str | None = Field(default=None, alias="IMAGEKIT_PRIVATE_KEY")
	imagekit_url_endpoint: str | None = Field(
		default=None,
		validation_alias=AliasChoices("IMAGEKIT_URL_ENDPOINT", "IMAGEKIT_URL"),
	)
	imagekit_folder: str = Field(default="/uploads", alias="IMAGEKIT_FOLDER")

settings = Settings()