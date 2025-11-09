from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..db.database import get_db
from ..models.models import Room, Building, Lease, User

router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.get("")
def get_statistics(db: Session = Depends(get_db)):
    """Get dashboard statistics."""

    # Count available rooms
    available_rooms = db.query(Room).filter(Room.status == "available").count()

    # Count total buildings
    total_buildings = db.query(Building).count()

    # Count active leases
    active_leases = db.query(Lease).filter(Lease.status == "active").count()

    # Count registered users
    registered_users = db.query(User).count()

    return {
        "available_rooms": available_rooms,
        "total_buildings": total_buildings,
        "active_leases": active_leases,
        "registered_users": registered_users
    }
