from fastapi import FastAPI
from app.routers import recommend

app = FastAPI(
    title="Clothing Image Recommendation API",
    description="Upload a clothing image and get similar items using CLIP",
    version="1.0.0",
)

# include routers
app.include_router(recommend.router)
