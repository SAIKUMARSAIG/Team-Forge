import os
import base64
import json
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import timedelta, datetime

import models, schemas, database, auth

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="TeamForge API")

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678/webhook/teamforge")
N8N_INTERNAL_SECRET = os.getenv("N8N_INTERNAL_SECRET", "simple_secret")

def verify_n8n_secret(x_internal_secret: str = Header(None)):
    if x_internal_secret != N8N_INTERNAL_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")
    return True

# --- AUTH ---
@app.post("/auth/register")
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        return {"success": False, "error": "Email already registered"}
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(full_name=user.full_name, email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"success": True, "data": {"id": new_user.id}}

@app.post("/auth/login")
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.password_hash):
        return {"success": False, "error": "Incorrect email or password"}
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(db_user.id)}, expires_delta=access_token_expires
    )
    user_data = {
        "id": db_user.id, "email": db_user.email, "full_name": db_user.full_name, "avatar_url": db_user.avatar_url
    }
    return {"success": True, "access_token": access_token, "user": user_data}

# --- USERS ---
@app.get("/users/{user_id}/profile")
def get_user_profile(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return {"success": False, "error": "User not found"}
    
    skills = db.query(models.Skill).join(models.UserSkill).filter(models.UserSkill.user_id == user_id).all()
    # Mocking past projects as empty for simplicity unless actually populated
    past_projects = db.query(models.PastProject).filter(models.PastProject.user_id == user_id).all()
    
    return {
        "success": True, 
        "data": {
            "user": {
                "id": user.id, "full_name": user.full_name, "bio": user.bio,
                "availability_status": user.availability_status, "github_url": user.github_url,
                "linkedin_url": user.linkedin_url, "leetcode_url": user.leetcode_url, "avatar_url": user.avatar_url,
                "profile_completeness_score": user.profile_completeness_score
            },
            "skills": [{"id": s.id, "name": s.name} for s in skills],
            "past_projects": [{"id": p.id, "title": p.title, "role": p.role, "description": p.description, "tech_stack": json.loads(p.tech_stack) if isinstance(p.tech_stack, str) else p.tech_stack} for p in past_projects]
        }
    }

@app.put("/users/{user_id}/profile")
def update_user_profile(user_id: int, profile: schemas.UserProfileUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.id != user_id:
        return {"success": False, "error": "Not authorized"}
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if profile.bio is not None: user.bio = profile.bio
    if profile.github_url is not None: user.github_url = profile.github_url
    if profile.linkedin_url is not None: user.linkedin_url = profile.linkedin_url
    if profile.leetcode_url is not None: user.leetcode_url = profile.leetcode_url
    if profile.availability_status is not None: user.availability_status = profile.availability_status
    
    # Simple base64 decode and save flow
    if profile.avatar_base64:
        # Avoid huge strings if possible, saving directly to local file system
        try:
            format, imgstr = profile.avatar_base64.split(';base64,') 
            ext = format.split('/')[-1]
            os.makedirs("uploads", exist_ok=True)
            filename = f"uploads/avatar_{user_id}.{ext}"
            with open(filename, "wb") as f:
                f.write(base64.b64decode(imgstr))
            user.avatar_url = f"/{filename}"
        except Exception as e:
            print("Avatar save error:", e)

    # Basic completeness scoring
    score = 0
    if user.bio: score += 30
    if user.github_url: score += 20
    if user.avatar_url: score += 10
    user.profile_completeness_score = min(100, score + 40) # Assume skills gives 40

    db.commit()
    return {"success": True, "data": {"message": "Profile updated"}}

@app.post("/users/{user_id}/skills")
def update_user_skills(user_id: int, data: dict, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.id != user_id: return {"success": False, "error": "Not authorized"}
    
    skills = data.get("skills", [])
    # Clear existing skills and replace
    db.query(models.UserSkill).filter(models.UserSkill.user_id == user_id).delete()
    
    for s_name in skills:
        skill = db.query(models.Skill).filter(models.Skill.name == s_name).first()
        if not skill:
            skill = models.Skill(name=s_name)
            db.add(skill)
            db.commit()
            db.refresh(skill)
        user_skill = models.UserSkill(user_id=user_id, skill_id=skill.id)
        db.add(user_skill)
    
    db.commit()
    return {"success": True, "data": {"message": "Skills updated"}}

@app.post("/users/{user_id}/past-projects")
def add_past_project(user_id: int, project: schemas.PastProjectCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.id != user_id: return {"success": False, "error": "Not authorized"}
    new_past_project = models.PastProject(
        user_id=user_id,
        title=project.title,
        role=project.role,
        description=project.description,
        tech_stack=json.dumps(project.tech_stack),
        github_url=project.github_url
    )
    db.add(new_past_project)
    db.commit()
    db.refresh(new_past_project)
    return {"success": True, "data": {"message": "Past project added", "id": new_past_project.id}}

# --- PROJECTS ---
@app.post("/projects")
def create_project(project: schemas.ProjectCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_proj = models.Project(
        owner_id=current_user.id, title=project.title, description=project.description,
        domain=project.domain, deadline=project.deadline
    )
    db.add(new_proj)
    db.commit()
    db.refresh(new_proj)

    for r in project.requirements:
        req = models.ProjectRequirement(
            project_id=new_proj.id, role_title=r.role_title, required_skills=json.dumps(r.required_skills)
        )
        db.add(req)
    
    db.commit()
    return {"success": True, "data": {"id": new_proj.id}}

@app.get("/projects")
def list_projects(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    owned = db.query(models.Project).filter(models.Project.owner_id == current_user.id).all()
    memberships = db.query(models.Project).join(models.ProjectMember).filter(models.ProjectMember.user_id == current_user.id, models.ProjectMember.status == 'accepted').all()
    
    unique_projects = {p.id: p for p in (owned + memberships)}
    
    projects = []
    for p in unique_projects.values():
        projects.append({
            "id": p.id, "title": p.title, "description": p.description,
            "status": p.status, "deadline": p.deadline
        })
    return {"success": True, "data": projects}

@app.get("/projects/{project_id}")
def get_project_detail(project_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        return {"success": False, "error": "Not found"}

    reqs = db.query(models.ProjectRequirement).filter(models.ProjectRequirement.project_id == project_id).all()
    members = db.query(models.ProjectMember).filter(models.ProjectMember.project_id == project_id).all()

    reqs_data = [{"id": r.id, "role_title": r.role_title, "required_skills": json.loads(r.required_skills), "is_filled": r.is_filled} for r in reqs]
    members_data = [{"id": m.id, "user_id": m.user_id, "role": m.role, "status": m.status} for m in members]

    project_data = {
        "id": p.id, "title": p.title, "description": p.description, 
        "domain": p.domain, "status": p.status, "deadline": p.deadline, "owner_id": p.owner_id
    }
    return {"success": True, "data": {"project": project_data, "requirements": reqs_data, "members": members_data}}

@app.post("/projects/{project_id}/publish")
def trigger_agent(project_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    p = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == current_user.id).first()
    if not p: return {"success": False, "error": "Not found or unauthorized"}
    
    job = models.AgentJob(project_id=project_id, status='completed', completed_at=datetime.utcnow())
    db.add(job)
    db.commit()
    db.refresh(job)

    # Clear previous suggestions
    db.query(models.SuggestedProfile).filter(models.SuggestedProfile.project_id == project_id).delete()
    
    reqs = db.query(models.ProjectRequirement).filter(models.ProjectRequirement.project_id == project_id).all()
    users = db.query(models.User).filter(models.User.id != current_user.id).all()

    for r in reqs:
        try:
            req_skills_list = json.loads(r.required_skills) if isinstance(r.required_skills, str) else r.required_skills
            req_skills = set(req_skills_list)
        except:
            req_skills = set()
        
        if not req_skills:
            continue
            
        req_skills_lower = {sk.lower() for sk in req_skills}
        
        for u in users:
            user_skills_query = db.query(models.Skill).join(models.UserSkill).filter(models.UserSkill.user_id == u.id).all()
            user_skill_names = {s.name.lower() for s in user_skills_query}
            
            intersection = req_skills_lower.intersection(user_skill_names)
            if intersection:
                match_score = len(intersection) / len(req_skills_lower)
                
                sugg = models.SuggestedProfile(
                    job_id=job.id,
                    project_id=project_id,
                    user_id=u.id,
                    matched_role_id=r.id,
                    role_title=r.role_title,
                    match_score=match_score,
                    reasoning=f"Matched skills: {', '.join([s.title() for s in intersection])}",
                    status="pending_review"
                )
                db.add(sugg)

    db.commit()

    return {"success": True, "data": {"job_id": job.id}}

@app.get("/projects/{project_id}/agent-job")
def get_agent_job(project_id: int, db: Session = Depends(database.get_db)):
    job = db.query(models.AgentJob).filter(models.AgentJob.project_id == project_id).order_by(models.AgentJob.id.desc()).first()
    if not job:
        return {"success": False, "error": "No job found"}
    return {"success": True, "data": {"id": job.id, "status": job.status}}

@app.get("/projects/{project_id}/suggestions")
def get_suggestions(project_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    suggestions = db.query(models.SuggestedProfile).filter(models.SuggestedProfile.project_id == project_id).all()
    # Resolve users
    data = []
    for s in suggestions:
        u = db.query(models.User).filter(models.User.id == s.user_id).first()
        data.append({
            "id": s.id, "user_id": s.user_id, "role_title": s.role_title,
            "match_score": s.match_score, "reasoning": s.reasoning, "status": s.status,
            "user": {"full_name": u.full_name, "avatar_url": u.avatar_url}
        })
    return {"success": True, "data": data}

@app.put("/projects/{project_id}/suggestions/{suggestion_id}")
def update_suggestion(project_id: int, suggestion_id: int, data: dict, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    sugg = db.query(models.SuggestedProfile).filter(models.SuggestedProfile.id == suggestion_id, models.SuggestedProfile.project_id == project_id).first()
    if not sugg: return {"success": False, "error": "Not found"}

    action = data.get("action")
    if action == "shortlist":
        sugg.status = "shortlisted"
    elif action == "reject":
        sugg.status = "rejected"
    
    db.commit()
    return {"success": True}

@app.post("/projects/{project_id}/invite/{user_id}")
def invite_user(project_id: int, user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    sugg = db.query(models.SuggestedProfile).filter(models.SuggestedProfile.project_id == project_id, models.SuggestedProfile.user_id == user_id, models.SuggestedProfile.status == 'shortlisted').first()
    role_title = sugg.role_title if sugg else "Member"

    existing_member = db.query(models.ProjectMember).filter(models.ProjectMember.project_id == project_id, models.ProjectMember.user_id == user_id).first()
    if existing_member:
        return {"success": False, "error": "User already invited or member"}

    new_member = models.ProjectMember(project_id=project_id, user_id=user_id, role=role_title, status='invited')
    db.add(new_member)
    db.commit()
    return {"success": True, "data": {}}

@app.get("/users/me/invitations")
def get_my_invitations(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    invites = db.query(models.ProjectMember).filter(models.ProjectMember.user_id == current_user.id, models.ProjectMember.status == 'invited').all()
    data = []
    for i in invites:
        p = db.query(models.Project).filter(models.Project.id == i.project_id).first()
        if p:
            data.append({
                "id": i.id, "project_id": p.id, "project_title": p.title, 
                "role": i.role, "status": i.status
            })
    return {"success": True, "data": data}

@app.post("/invitations/{invitation_id}/respond")
def respond_invitation(invitation_id: int, data: dict, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    invite = db.query(models.ProjectMember).filter(models.ProjectMember.id == invitation_id, models.ProjectMember.user_id == current_user.id).first()
    if not invite: return {"success": False, "error": "Not found"}

    action = data.get("action")
    if action == "accept":
        invite.status = "accepted"
        req = db.query(models.ProjectRequirement).filter(models.ProjectRequirement.project_id == invite.project_id, models.ProjectRequirement.role_title == invite.role, models.ProjectRequirement.is_filled == False).first()
        if req:
            req.is_filled = True
    elif action == "decline":
        invite.status = "declined"
    
    db.commit()
    return {"success": True}

# --- INTERNAL (N8N) ---
@app.get("/internal/projects/{project_id}/requirements")
def internal_get_requirements(project_id: int, db: Session = Depends(database.get_db), _=Depends(verify_n8n_secret)):
    reqs = db.query(models.ProjectRequirement).filter(models.ProjectRequirement.project_id == project_id, models.ProjectRequirement.is_filled == False).all()
    return {"data": [{"id": r.id, "role": r.role_title, "skills": json.loads(r.required_skills)} for r in reqs]}

@app.get("/internal/users/eligible")
def internal_get_eligible_users(db: Session = Depends(database.get_db), _=Depends(verify_n8n_secret)):
    users = db.query(models.User).filter(models.User.availability_status == 'available', models.User.profile_completeness_score >= 60).all()
    data = []
    for u in users:
        skills = db.query(models.Skill).join(models.UserSkill).filter(models.UserSkill.user_id == u.id).all()
        past = db.query(models.PastProject).filter(models.PastProject.user_id == u.id).all()
        # simplified 
        data.append({
            "id": u.id, "name": u.full_name, "bio": u.bio,
            "skills": [s.name for s in skills],
            "past_projects": [{"title": p.title, "tech_stack": p.tech_stack, "rating": p.peer_rating} for p in past]
        })
    return {"data": data}

@app.post("/internal/suggestions/save")
def internal_save_suggestions(data: dict, db: Session = Depends(database.get_db), _=Depends(verify_n8n_secret)):
    project_id = data.get("project_id")
    job_id = data.get("job_id")
    suggestions = data.get("suggestions", [])

    for s in suggestions:
        sugg = models.SuggestedProfile(
            job_id=job_id, project_id=project_id, user_id=s["user_id"],
            matched_role_id=s["requirement_id"], role_title=s["role_title"],
            match_score=s["score"], reasoning=s["reasoning"], status="pending_review"
        )
        db.add(sugg)
    
    # Update job
    job = db.query(models.AgentJob).filter(models.AgentJob.id == job_id).first()
    if job:
        job.status = 'completed'
        job.completed_at = datetime.utcnow()
    
    db.commit()
    return {"success": True}
