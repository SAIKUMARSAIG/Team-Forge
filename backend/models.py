from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    availability_status = Column(String(50), default='available')
    github_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    leetcode_url = Column(String(255), nullable=True)
    profile_completeness_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    skills = relationship("UserSkill", back_populates="user")
    projects_owned = relationship("Project", back_populates="owner")
    past_projects = relationship("PastProject", back_populates="user")
    memberships = relationship("ProjectMember", back_populates="user")
    suggestions = relationship("SuggestedProfile", back_populates="user")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    category = Column(String(100), nullable=True)

    user_skills = relationship("UserSkill", back_populates="skill")


class UserSkill(Base):
    __tablename__ = "user_skills"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), primary_key=True)
    proficiency_level = Column(Integer, default=3)

    user = relationship("User", back_populates="skills")
    skill = relationship("Skill", back_populates="user_skills")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    domain = Column(String(100), nullable=True)
    status = Column(String(50), default='active')
    deadline = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="projects_owned")
    requirements = relationship("ProjectRequirement", back_populates="project")
    members = relationship("ProjectMember", back_populates="project")
    agent_jobs = relationship("AgentJob", back_populates="project")
    suggestions = relationship("SuggestedProfile", back_populates="project")


class ProjectRequirement(Base):
    __tablename__ = "project_requirements"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    role_title = Column(String(100))
    required_skills = Column(JSON) # Storing as JSON string or json
    is_filled = Column(Boolean, default=False)

    project = relationship("Project", back_populates="requirements")


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String(100))
    status = Column(String(50), default='invited') # invited, accepted, declined

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="memberships")


class PastProject(Base):
    __tablename__ = "past_projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255))
    role = Column(String(100))
    tech_stack = Column(JSON)
    description = Column(Text)
    github_url = Column(String(255))
    peer_rating = Column(Float, default=5.0)

    user = relationship("User", back_populates="past_projects")


class AgentJob(Base):
    __tablename__ = "agent_jobs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    status = Column(String(50), default='pending') # pending, running, completed, failed
    triggered_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="agent_jobs")


class SuggestedProfile(Base):
    __tablename__ = "suggested_profiles"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("agent_jobs.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    matched_role_id = Column(Integer, ForeignKey("project_requirements.id"))
    role_title = Column(String(100))
    match_score = Column(Float, default=0.0)
    reasoning = Column(Text)
    status = Column(String(50), default='pending_review') # pending_review, shortlisted, rejected

    project = relationship("Project", back_populates="suggestions")
    user = relationship("User", back_populates="suggestions")
