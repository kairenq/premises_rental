from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .core.config import settings
from .db.database import engine, Base, SessionLocal
from .db.init_db import init_database
from .api import auth, rooms, companies, buildings, leases, reviews, maintenance, stats
import os

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize database with test data
db = SessionLocal()
try:
    init_database(db)
finally:
    db.close()

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware - Allow both specific origins and Netlify regex
cors_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://premisesrental.netlify.app",  # Конкретный домен Netlify
]

# Add environment variable if set
if settings.BACKEND_CORS_ORIGINS:
    for origin in settings.BACKEND_CORS_ORIGINS:
        if origin and origin not in cors_origins:
            cors_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.netlify\.app",  # Разрешить все поддомены Netlify
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Create uploads directory
os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/rooms", exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(rooms.router, prefix=settings.API_V1_STR)
app.include_router(companies.router, prefix=settings.API_V1_STR)
app.include_router(buildings.router, prefix=settings.API_V1_STR)
app.include_router(leases.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(maintenance.router, prefix=settings.API_V1_STR)
app.include_router(stats.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Premises Rental System API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/api/v1/admin/reset-database")
async def reset_database():
    """
    DANGER: Recreate all database tables (deletes all data!)
    Use this only when schema changes require database reset.
    """
    try:
        # Drop all tables
        Base.metadata.drop_all(bind=engine)

        # Recreate all tables
        Base.metadata.create_all(bind=engine)

        # Re-initialize database with test data
        db = SessionLocal()
        try:
            init_database(db)
        finally:
            db.close()

        return {
            "status": "success",
            "message": "Database has been reset and reinitialized with test data"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to reset database: {str(e)}"
        }
