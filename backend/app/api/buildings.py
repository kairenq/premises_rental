from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..db.database import get_db
from ..schemas.schemas import BuildingCreate, BuildingUpdate, BuildingResponse
from ..models.models import Building, User
from ..core.deps import get_current_admin, get_current_landlord_or_admin

router = APIRouter(prefix="/buildings", tags=["Buildings"])


@router.get("", response_model=List[BuildingResponse])
def get_buildings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all buildings."""
    buildings = db.query(Building).offset(skip).limit(limit).all()
    return buildings


@router.get("/{building_id}", response_model=BuildingResponse)
def get_building(building_id: int, db: Session = Depends(get_db)):
    """Get building by ID."""
    building = db.query(Building).filter(Building.building_id == building_id).first()
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Building not found"
        )
    return building


@router.post("", response_model=BuildingResponse)
def create_building(
    building_data: BuildingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord_or_admin)
):
    """Create a new building (landlord or admin)."""
    new_building = Building(**building_data.model_dump())
    db.add(new_building)
    db.commit()
    db.refresh(new_building)
    return new_building


@router.put("/{building_id}", response_model=BuildingResponse)
def update_building(
    building_id: int,
    building_data: BuildingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord_or_admin)
):
    """Update building (landlord or admin)."""
    building = db.query(Building).filter(Building.building_id == building_id).first()
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Building not found"
        )

    update_data = building_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(building, field, value)

    db.commit()
    db.refresh(building)
    return building


@router.delete("/{building_id}")
def delete_building(
    building_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord_or_admin)
):
    """Delete building (landlord or admin)."""
    building = db.query(Building).filter(Building.building_id == building_id).first()
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Building not found"
        )

    db.delete(building)
    db.commit()
    return {"message": "Building deleted successfully"}
