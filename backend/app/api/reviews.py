from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..db.database import get_db
from ..schemas.schemas import ReviewCreate, ReviewResponse, RoomCategoryCreate, RoomCategoryResponse, FavoriteCreate, FavoriteResponse
from ..models.models import Review, RoomCategory, Favorite, User, Room
from ..core.deps import get_current_user, get_current_admin

router = APIRouter(tags=["Reviews & Categories"])


# Reviews
@router.get("/rooms/{room_id}/reviews", response_model=List[ReviewResponse])
def get_room_reviews(room_id: int, db: Session = Depends(get_db)):
    """Get all reviews for a room."""
    reviews = db.query(Review).filter(Review.room_id == room_id).all()
    return reviews


@router.post("/reviews", response_model=ReviewResponse)
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a review for a room."""
    # Check if room exists
    room = db.query(Room).filter(Room.room_id == review_data.room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Create review
    new_review = Review(
        user_id=current_user.user_id,
        **review_data.model_dump()
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review


@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a review."""
    review = db.query(Review).filter(Review.review_id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    # Check permissions
    if current_user.role != "admin" and review.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    db.delete(review)
    db.commit()
    return {"message": "Review deleted successfully"}


# Room Categories
@router.get("/categories", response_model=List[RoomCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Get all room categories."""
    categories = db.query(RoomCategory).all()
    return categories


@router.post("/categories", response_model=RoomCategoryResponse)
def create_category(
    category_data: RoomCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new room category (admin only)."""
    new_category = RoomCategory(**category_data.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


# Favorites
@router.get("/favorites", response_model=List[FavoriteResponse])
def get_user_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's favorite rooms."""
    favorites = db.query(Favorite).filter(Favorite.user_id == current_user.user_id).all()
    return favorites


@router.post("/favorites", response_model=FavoriteResponse)
def add_to_favorites(
    favorite_data: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a room to favorites."""
    # Check if already in favorites
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.user_id,
        Favorite.room_id == favorite_data.room_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room already in favorites"
        )

    new_favorite = Favorite(
        user_id=current_user.user_id,
        room_id=favorite_data.room_id
    )
    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)
    return new_favorite


@router.delete("/favorites/{favorite_id}")
def remove_from_favorites(
    favorite_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a room from favorites."""
    favorite = db.query(Favorite).filter(Favorite.favorite_id == favorite_id).first()
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found"
        )

    # Check permissions
    if favorite.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    db.delete(favorite)
    db.commit()
    return {"message": "Removed from favorites"}
