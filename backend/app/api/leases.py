from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..db.database import get_db
from ..schemas.schemas import LeaseCreate, LeaseUpdate, LeaseResponse, PaymentCreate, PaymentResponse
from ..models.models import Lease, Payment, User, Room
from ..core.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/leases", tags=["Leases"])


@router.get("", response_model=List[LeaseResponse])
def get_leases(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leases. Users see only their own, admins see all."""
    query = db.query(Lease)

    if current_user.role != "admin":
        query = query.filter(Lease.tenant_id == current_user.user_id)

    leases = query.offset(skip).limit(limit).all()
    return leases


@router.get("/{lease_id}", response_model=LeaseResponse)
def get_lease(
    lease_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get lease by ID."""
    lease = db.query(Lease).filter(Lease.lease_id == lease_id).first()
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found"
        )

    # Check permissions
    if current_user.role != "admin" and lease.tenant_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    return lease


@router.post("", response_model=LeaseResponse)
def create_lease(
    lease_data: LeaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new lease."""
    # Check if room is available
    room = db.query(Room).filter(Room.room_id == lease_data.room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    if room.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is not available"
        )

    # Create lease
    new_lease = Lease(**lease_data.model_dump())
    db.add(new_lease)

    # Update room status
    room.status = "occupied"

    db.commit()
    db.refresh(new_lease)
    return new_lease


@router.put("/{lease_id}", response_model=LeaseResponse)
def update_lease(
    lease_id: int,
    lease_data: LeaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update lease (admin only)."""
    lease = db.query(Lease).filter(Lease.lease_id == lease_id).first()
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found"
        )

    update_data = lease_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lease, field, value)

    db.commit()
    db.refresh(lease)
    return lease


@router.delete("/{lease_id}")
def delete_lease(
    lease_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete/terminate lease (admin only)."""
    lease = db.query(Lease).filter(Lease.lease_id == lease_id).first()
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found"
        )

    # Update room status
    room = db.query(Room).filter(Room.room_id == lease.room_id).first()
    if room:
        room.status = "available"

    db.delete(lease)
    db.commit()
    return {"message": "Lease deleted successfully"}


# Payments
@router.get("/{lease_id}/payments", response_model=List[PaymentResponse])
def get_lease_payments(
    lease_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all payments for a lease."""
    lease = db.query(Lease).filter(Lease.lease_id == lease_id).first()
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found"
        )

    # Check permissions
    if current_user.role != "admin" and lease.tenant_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    payments = db.query(Payment).filter(Payment.lease_id == lease_id).all()
    return payments


@router.post("/{lease_id}/payments", response_model=PaymentResponse)
def create_payment(
    lease_id: int,
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a payment for a lease."""
    lease = db.query(Lease).filter(Lease.lease_id == lease_id).first()
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found"
        )

    new_payment = Payment(**payment_data.model_dump())
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment
