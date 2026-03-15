from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List, Any, Dict
from datetime import datetime

class UserBase(BaseModel):
    full_name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    leetcode_url: Optional[str] = None
    availability_status: Optional[str] = None
    avatar_base64: Optional[str] = None
    
class PastProjectCreate(BaseModel):
    title: str
    role: str
    description: str
    tech_stack: List[str]
    github_url: Optional[str] = None

class SkillBase(BaseModel):
    name: str

class UserResponse(UserBase):
    id: int
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    availability_status: str
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    leetcode_url: Optional[str] = None
    profile_completeness_score: int

    class Config:
        from_attributes = True

class PastProjectResponse(PastProjectCreate):
    id: int
    user_id: int
    peer_rating: float

    class Config:
        from_attributes = True

class ProjectRequirementCreate(BaseModel):
    role_title: str
    required_skills: List[str]

class ProjectCreate(BaseModel):
    title: str
    description: str
    domain: str
    deadline: str
    requirements: List[ProjectRequirementCreate]

class ProjectRequirementResponse(BaseModel):
    id: int
    role_title: str
    required_skills: List[str]
    is_filled: bool

    class Config:
        from_attributes = True

class ProjectMemberResponse(BaseModel):
    id: int
    user_id: int
    role: str
    status: str

    class Config:
        from_attributes = True

class ProjectResponse(BaseModel):
    id: int
    owner_id: int
    title: str
    description: str
    domain: str
    status: str
    deadline: Optional[str] = None

    class Config:
        from_attributes = True
