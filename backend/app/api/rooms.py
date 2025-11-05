from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from ..db.database import get_db
from ..schemas.schemas import RoomCreate, RoomUpdate, RoomResponse, RoomPhotoResponse
from ..models.models import Room, RoomPhoto, User
from ..core.deps import get_current_user, get_current_admin
import os
import shutil
from uuid import uuid4

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.get("", response_model=List[RoomResponse])
def get_rooms(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    category_id: Optional[int] = None,
    building_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Get all rooms with optional filters."""
    query = db.query(Room)

    if status:
        query = query.filter(Room.status == status)
    if category_id:
        query = query.filter(Room.category_id == category_id)
    if building_id:
        query = query.filter(Room.building_id == building_id)
    if min_price:
        query = query.filter(Room.price_per_month >= min_price)
    if max_price:
        query = query.filter(Room.price_per_month <= max_price)

    rooms = query.offset(skip).limit(limit).all()
    return rooms


@router.get("/{room_id}", response_model=RoomResponse)
def get_room(room_id: int, db: Session = Depends(get_db)):
    """Get room by ID."""
    room = db.query(Room).filter(Room.room_id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    return room


@router.post("", response_model=RoomResponse)
def create_room(
    room_data: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new room (admin only)."""
    new_room = Room(**room_data.model_dump())
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room


@router.put("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    room_data: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update room (admin only)."""
    room = db.query(Room).filter(Room.room_id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    update_data = room_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(room, field, value)

    db.commit()
    db.refresh(room)
    return room


@router.delete("/{room_id}")
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete room (admin only)."""
    room = db.query(Room).filter(Room.room_id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    db.delete(room)
    db.commit()
    return {"message": "Room deleted successfully"}


@router.post("/{room_id}/photos", response_model=RoomPhotoResponse)
async def upload_room_photo(
    room_id: int,
    file: UploadFile = File(...),
    description: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Upload a photo for a room (admin only)."""
    room = db.query(Room).filter(Room.room_id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Save file
    upload_dir = "uploads/rooms"
    os.makedirs(upload_dir, exist_ok=True)

    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"{uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create photo record
    photo = RoomPhoto(
        room_id=room_id,
        photo_url=f"/uploads/rooms/{file_name}",
        description=description
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)

    return photo


@router.delete("/photos/{photo_id}")
def delete_room_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete room photo (admin only)."""
    photo = db.query(RoomPhoto).filter(RoomPhoto.photo_id == photo_id).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )

    # Delete file
    if os.path.exists(photo.photo_url.lstrip("/")):
        os.remove(photo.photo_url.lstrip("/"))

    db.delete(photo)
    db.commit()
    return {"message": "Photo deleted successfully"}
