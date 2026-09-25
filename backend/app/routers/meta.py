from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.listing import Amenity
from app.schemas.listing import AmenityRead
from app.seed.seed import CATEGORIES

router = APIRouter(prefix="/meta", tags=["Metadata"])


@router.get("/categories", response_model=List[Dict[str, Any]])
def get_categories():
    """Retrieve global listing categories with icons for CategoryBar."""
    return CATEGORIES


@router.get("/amenities", response_model=List[AmenityRead])
def get_amenities(db: Session = Depends(get_db)):
    """Retrieve global amenities list for filter modal and listing forms."""
    return db.query(Amenity).order_by(Amenity.id.asc()).all()
