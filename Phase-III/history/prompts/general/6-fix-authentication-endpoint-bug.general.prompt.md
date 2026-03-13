---
id: 6
title: Fix authentication endpoint bug
stage: green
date: 2026-02-14
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-todo-web
user: developer
command: none
labels: ["bug-fix", "authentication", "backend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/api/auth/auth.py
tests:
  - Python syntax validation
---

## Prompt

There's a critical bug in the backend authentication system. The `/api/auth/user` endpoint returns 501 Not Implemented, but the frontend calls this endpoint after login to fetch user information.

**File to fix**: `backend/src/api/auth/auth.py`

**Current code (line 107-112)**:
```python
@router.get("/user", response_model=UserOut)
async def get_current_user_info(db: Session = Depends(get_db)) -> UserOut:
    """Get current user from token - requires authentication"""
    # This endpoint requires JWT middleware or dependency injection
    # For now, return a placeholder
    raise HTTPException(status_code=501, detail="Not implemented - requires auth middleware")
```

**What you need to do**:
1. Import the `get_current_user_id` function from `...middleware.auth`
2. Update the endpoint to use `get_current_user_id` as a dependency to extract user_id from JWT token
3. Fetch the user from database using the user_id
4. Return the user information

**Expected implementation**:
```python
@router.get("/user", response_model=UserOut)
async def get_current_user_info(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> UserOut:
    """Get current user from token - requires authentication"""
    user = get_user(db, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(email=user.email, id=user.id)
```

This will make the authentication flow work properly: Login → Get Token → Fetch User Info → Redirect to Dashboard

## Response snapshot

Fixed the authentication endpoint by:

1. Added import statement for `get_current_user_id` from `...middleware.auth` at line 12
2. Updated the `/api/auth/user` endpoint (lines 108-117) to:
   - Use `get_current_user_id` as a dependency to extract and verify JWT token
   - Fetch user from database using the authenticated user_id
   - Return 404 if user not found
   - Return UserOut with email and id on success

The endpoint now properly:
- Extracts JWT token from Authorization header via HTTPBearer security
- Verifies token signature using BETTER_AUTH_SECRET
- Decodes user_id from token payload
- Fetches user from database
- Returns user information or appropriate error

This completes the authentication flow: Login → JWT Token → User Info → Dashboard redirect.

## Outcome

- ✅ Impact: Critical authentication bug fixed - `/api/auth/user` endpoint now functional
- 🧪 Tests: Python syntax validation passed, import test successful
- 📁 Files: Modified backend/src/api/auth/auth.py (added import, updated endpoint)
- 🔁 Next prompts: Test full authentication flow end-to-end, verify frontend integration
- 🧠 Reflection: The fix was straightforward - leveraged existing get_current_user_id dependency from middleware. The endpoint now properly integrates JWT authentication with database user lookup.

## Evaluation notes (flywheel)

- Failure modes observed: None - syntax validation and import test passed
- Graders run and results (PASS/FAIL): PASS - Python compilation successful, import successful
- Prompt variant (if applicable): Direct implementation request with expected code provided
- Next experiment (smallest change to try): Test with actual HTTP requests to verify token extraction and user lookup work correctly
