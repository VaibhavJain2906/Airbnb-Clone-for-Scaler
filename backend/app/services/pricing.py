from datetime import date
from pydantic import BaseModel
from app.core.config import settings


class PriceQuote(BaseModel):
    nightly_price: float
    nights: int
    base_price: float
    cleaning_fee: float
    service_fee: float
    total_price: float


def calculate_price_quote(
    nightly_price: float,
    cleaning_fee: float,
    check_in: date,
    check_out: date,
) -> PriceQuote:
    """
    Centralized pricing calculator.
    Formula:
        nights = (check_out - check_in).days
        base_price = nightly_price * nights
        service_fee = base_price * SERVICE_FEE_PERCENTAGE (14%)
        total_price = base_price + cleaning_fee + service_fee
    """
    if check_out <= check_in:
        raise ValueError("Check-out date must be after check-in date.")

    nights = (check_out - check_in).days
    base_price = round(nightly_price * nights, 2)
    service_fee = round(base_price * settings.SERVICE_FEE_PERCENTAGE, 2)
    total_price = round(base_price + cleaning_fee + service_fee, 2)

    return PriceQuote(
        nightly_price=round(nightly_price, 2),
        nights=nights,
        base_price=base_price,
        cleaning_fee=round(cleaning_fee, 2),
        service_fee=service_fee,
        total_price=total_price,
    )
