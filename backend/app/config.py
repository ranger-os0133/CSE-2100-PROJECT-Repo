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
	imagekit_public_key: str | None = Field(default=None, alias="IMAGEKIT_PUBLIC_KEY")
	imagekit_private_key: str | None = Field(default=None, alias="IMAGEKIT_PRIVATE_KEY")
	imagekit_url_endpoint: str | None = Field(
		default=None,
		validation_alias=AliasChoices("IMAGEKIT_URL_ENDPOINT", "IMAGEKIT_URL"),
	)
	imagekit_folder: str = Field(default="/uploads", alias="IMAGEKIT_FOLDER")

settings = Settings()