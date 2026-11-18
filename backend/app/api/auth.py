from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pwdlib import PasswordHash

from app.database.session import get_db
from app.models.user import User, UserProfile
from app.schemas.auth import UserRegister, UserResponse, UserLogin, TokenResponse
from app.core.config import get_settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

password_hash = PasswordHash.recommended()
settings = get_settings()


@router.get("/test")
def auth_test():
    return {
        "status": "SUCCESS",
        "message": "Authentication API is working"
    }


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(data: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed_password = password_hash.hash(data.password)

    new_user = User(
        email=data.email,
        password_hash=hashed_password
    )

    db.add(new_user)
    db.flush()

    new_profile = UserProfile(
        user_id=new_user.id,
        full_name=data.full_name
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "full_name": data.full_name,
        "email": new_user.email,
        "is_active": new_user.is_active
    }


@router.post("/login", response_model=TokenResponse)
def login_user(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user or not password_hash.verify(
        data.password, user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    token = jwt.encode(
        {"sub": str(user.id), "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

from app.api.dependencies import get_current_user


@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "is_active": current_user.is_active
    }