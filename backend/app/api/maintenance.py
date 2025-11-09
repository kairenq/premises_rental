from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..db.database import get_db
from ..schemas.schemas import MaintenanceRequestCreate, MaintenanceRequestUpdate, MaintenanceRequestResponse
from ..models.models import MaintenanceRequest, User
from ..core.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@router.get("", response_model=List[MaintenanceRequestResponse])
def get_maintenance_requests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get maintenance requests. Users see only their own, admins see all."""
    query = db.query(MaintenanceRequest)

    if current_user.role != "admin":
        query = query.filter(MaintenanceRequest.tenant_id == current_user.user_id)

    requests = query.offset(skip).limit(limit).all()
    return requests


@router.get("/{request_id}", response_model=MaintenanceRequestResponse)
def get_maintenance_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get maintenance request by ID."""
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.request_id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )

    # Check permissions
    if current_user.role != "admin" and request.tenant_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    return request


@router.post("", response_model=MaintenanceRequestResponse)
def create_maintenance_request(
    request_data: MaintenanceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new maintenance request."""
    new_request = MaintenanceRequest(
        tenant_id=current_user.user_id,
        **request_data.model_dump()
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


@router.put("/{request_id}", response_model=MaintenanceRequestResponse)
def update_maintenance_request(
    request_id: int,
    request_data: MaintenanceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update maintenance request (admin only)."""
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.request_id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )

    update_data = request_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(request, field, value)

    # If status changed to resolved, set resolved_at
    if "status" in update_data and update_data["status"] == "resolved":
        request.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(request)
    return request


@router.delete("/{request_id}")
def delete_maintenance_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete maintenance request (admin only)."""
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.request_id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )

    db.delete(request)
    db.commit()
    return {"message": "Maintenance request deleted successfully"}
