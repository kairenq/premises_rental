from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Enums
class UserRole(str, Enum):
    admin = "admin"
    user = "user"
    landlord = "landlord"


class RoomStatus(str, Enum):
    available = "available"
    occupied = "occupied"
    maintenance = "maintenance"


class LeaseStatus(str, Enum):
    active = "active"
    expired = "expired"
    terminated = "terminated"


class PaymentStatus(str, Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"


# User schemas
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole = UserRole.user


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None


class UserResponse(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None


# Company schemas
class CompanyBase(BaseModel):
    name: str
    tax_id: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    tax_id: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None


class CompanyResponse(CompanyBase):
    company_id: int

    class Config:
        from_attributes = True


# Building schemas
class BuildingBase(BaseModel):
    company_id: int
    name: str
    address: str
    year_built: Optional[int] = None
    total_area: Optional[float] = None
    description: Optional[str] = None


class BuildingCreate(BuildingBase):
    pass


class BuildingUpdate(BaseModel):
    company_id: Optional[int] = None
    name: Optional[str] = None
    address: Optional[str] = None
    year_built: Optional[int] = None
    total_area: Optional[float] = None
    description: Optional[str] = None


class BuildingResponse(BuildingBase):
    building_id: int

    class Config:
        from_attributes = True


# Room Category schemas
class RoomCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class RoomCategoryCreate(RoomCategoryBase):
    pass


class RoomCategoryResponse(RoomCategoryBase):
    category_id: int

    class Config:
        from_attributes = True


# Room Photo schemas
class RoomPhotoBase(BaseModel):
    photo_url: str
    description: Optional[str] = None


class RoomPhotoCreate(RoomPhotoBase):
    room_id: int


class RoomPhotoResponse(RoomPhotoBase):
    photo_id: int
    room_id: int

    class Config:
        from_attributes = True


# Room schemas
class RoomBase(BaseModel):
    building_id: Optional[int] = None
    category_id: int
    room_number: str
    floor: Optional[int] = None
    area: Optional[float] = None
    price_per_month: float
    status: RoomStatus = RoomStatus.available
    description: Optional[str] = None


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    building_id: Optional[int] = None
    category_id: Optional[int] = None
    room_number: Optional[str] = None
    floor: Optional[int] = None
    area: Optional[float] = None
    price_per_month: Optional[float] = None
    status: Optional[RoomStatus] = None
    description: Optional[str] = None


class RoomResponse(RoomBase):
    room_id: int
    photos: List[RoomPhotoResponse] = []

    class Config:
        from_attributes = True


# Lease schemas
class LeaseBase(BaseModel):
    room_id: int
    tenant_id: int
    start_date: datetime
    end_date: datetime
    monthly_rent: float
    deposit: Optional[float] = None
    status: LeaseStatus = LeaseStatus.active


class LeaseCreate(LeaseBase):
    pass


class LeaseUpdate(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    monthly_rent: Optional[float] = None
    deposit: Optional[float] = None
    status: Optional[LeaseStatus] = None


class LeaseResponse(LeaseBase):
    lease_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Payment schemas
class PaymentBase(BaseModel):
    lease_id: int
    amount: float
    payment_method: Optional[str] = None
    status: PaymentStatus = PaymentStatus.completed


class PaymentCreate(PaymentBase):
    pass


class PaymentResponse(PaymentBase):
    payment_id: int
    payment_date: datetime

    class Config:
        from_attributes = True


# Review schemas
class ReviewBase(BaseModel):
    room_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    review_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Maintenance Request schemas
class MaintenanceRequestBase(BaseModel):
    room_id: int
    description: str
    priority: str = "medium"


class MaintenanceRequestCreate(MaintenanceRequestBase):
    pass


class MaintenanceRequestUpdate(BaseModel):
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class MaintenanceRequestResponse(MaintenanceRequestBase):
    request_id: int
    tenant_id: int
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Notification schemas
class NotificationBase(BaseModel):
    message: str


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationResponse(NotificationBase):
    notification_id: int
    user_id: int
    created_at: datetime
    is_read: bool

    class Config:
        from_attributes = True


# Favorite schemas
class FavoriteCreate(BaseModel):
    room_id: int


class FavoriteResponse(BaseModel):
    favorite_id: int
    user_id: int
    room_id: int

    class Config:
        from_attributes = True
