import os
import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings

ALGORITHM = "HS256"
EXPIRY_HOURS = 8

def create_token(user):
    now = datetime.now(timezone.utc)
    payload = {"sub": str(user.id), "role": user.role, "iat": now, "exp": now + timedelta(hours=EXPIRY_HOURS)}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token):
    if not token:
        return None
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
