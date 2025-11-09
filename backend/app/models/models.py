from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from ..db.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"
    landlord = "landlord"


class RoomStatus(str, enum.Enum):
    available = "available"
    occupied = "occupied"
    maintenance = "maintenance"


class LeaseStatus(str, enum.Enum):
    active = "active"
    expired = "expired"
    terminated = "terminated"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"


class RequestStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    resolved = "resolved"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    role = Column(String, default=UserRole.user.value)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    activity_logs = relationship("ActivityLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")
    leases = relationship("Lease", back_populates="tenant")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="tenant")


class Company(Base):
    __tablename__ = "companies"

    company_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    tax_id = Column(String, unique=True)
    address = Column(String)
    contact_person = Column(String)
    phone = Column(String)
    email = Column(String)
    description = Column(Text)

    # Relationships
    buildings = relationship("Building", back_populates="company")


class Building(Base):
    __tablename__ = "buildings"

    building_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"))
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    year_built = Column(Integer)
    total_area = Column(Float)
    description = Column(Text)

    # Relationships
    company = relationship("Company", back_populates="buildings")
    rooms = relationship("Room", back_populates="building")


class RoomCategory(Base):
    __tablename__ = "room_categories"

    category_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)

    # Relationships
    rooms = relationship("Room", back_populates="category")


class Room(Base):
    __tablename__ = "rooms"

    room_id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.building_id"), nullable=True)
    category_id = Column(Integer, ForeignKey("room_categories.category_id"))
    room_number = Column(String, nullable=False)
    floor = Column(Integer)
    area = Column(Float)
    price_per_month = Column(Float, nullable=False)
    status = Column(String, default=RoomStatus.available.value)
    description = Column(Text)

    # Relationships
    building = relationship("Building", back_populates="rooms")
    category = relationship("RoomCategory", back_populates="rooms")
    photos = relationship("RoomPhoto", back_populates="room", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="room")
    favorites = relationship("Favorite", back_populates="room")
    leases = relationship("Lease", back_populates="room")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="room")


class Lease(Base):
    __tablename__ = "leases"

    lease_id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.room_id"))
    tenant_id = Column(Integer, ForeignKey("users.user_id"))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    monthly_rent = Column(Float, nullable=False)
    deposit = Column(Float)
    status = Column(String, default=LeaseStatus.active.value)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    room = relationship("Room", back_populates="leases")
    tenant = relationship("User", back_populates="leases")
    payments = relationship("Payment", back_populates="lease")
    lease_history = relationship("LeaseHistory", back_populates="lease")


class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(Integer, primary_key=True, index=True)
    lease_id = Column(Integer, ForeignKey("leases.lease_id"))
    payment_date = Column(DateTime, default=datetime.utcnow)
    amount = Column(Float, nullable=False)
    payment_method = Column(String)
    status = Column(String, default=PaymentStatus.completed.value)

    # Relationships
    lease = relationship("Lease", back_populates="payments")


class Review(Base):
    __tablename__ = "reviews"

    review_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    room_id = Column(Integer, ForeignKey("rooms.room_id"))
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="reviews")
    room = relationship("Room", back_populates="reviews")


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    request_id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.room_id"))
    tenant_id = Column(Integer, ForeignKey("users.user_id"))
    description = Column(Text, nullable=False)
    priority = Column(String, default="medium")
    status = Column(String, default=RequestStatus.pending.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    room = relationship("Room", back_populates="maintenance_requests")
    tenant = relationship("User", back_populates="maintenance_requests")


class ActivityLog(Base):
    __tablename__ = "activity_log"

    log_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    action = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="activity_logs")


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="notifications")


class Favorite(Base):
    __tablename__ = "favorites"

    favorite_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    room_id = Column(Integer, ForeignKey("rooms.room_id"))

    # Relationships
    user = relationship("User", back_populates="favorites")
    room = relationship("Room", back_populates="favorites")


class RoomPhoto(Base):
    __tablename__ = "room_photos"

    photo_id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.room_id"))
    photo_url = Column(String, nullable=False)
    description = Column(Text)

    # Relationships
    room = relationship("Room", back_populates="photos")


class LeaseHistory(Base):
    __tablename__ = "lease_history"

    history_id = Column(Integer, primary_key=True, index=True)
    lease_id = Column(Integer, ForeignKey("leases.lease_id"))
    change_date = Column(DateTime, default=datetime.utcnow)
    previous_status = Column(String)
    new_status = Column(String)
    comment = Column(Text)

    # Relationships
    lease = relationship("Lease", back_populates="lease_history")
