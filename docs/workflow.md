# Git Workflow Ruleset & Developer Guide

## Branch Structure

```
main
├── BE      <-- (Main stable backend branch)
│   ├── BE-RBAC
│   ├── BE-[feature1]
│   └── ...
└── FE      <-- (Main stable frontend branch)
    ├── FE-Components
    ├── FE-[feature2]
    └── ...
```

### Branch Naming Rules

* Backend: `BE-[feature-name]`
* Frontend: `FE-[feature-name]`
* Only `BE` can merge feature branches from BE-devs
* Only `FE` can merge feature branches from FE-devs
* Only `main` can pull from `BE` and `FE`

## Git Workflow Guide

### 1. Creating a New Feature Branch

```bash
# From the BE branch
git checkout BE

git pull origin BE

git checkout -b BE-[feature-name]
```

```bash
# From the FE branch
git checkout FE

git pull origin FE

git checkout -b FE-[feature-name]
```

### 2. Committing Work

```bash
# Example: commit from 'BE-RBAC' branch
git add .
git commit -m "[BE-RBAC] Add login route and middleware auth"
git push origin BE-RBAC
```

> ⚠️ Use a clear prefix in commit messages.

### 3. Keeping Feature Branch Updated

```bash
# Example: use RBAC branch (from BE) and pull from main-backend branch
git checkout BE-RBAC
git pull origin BE
```

```bash
# Example: use Component branch (from FE) and pull from main-frontend branch
git checkout FE-Components
git pull origin FE
```

> ⚠️ Always pull the latest before merging or pull request (PR).

### 4. Merging to Main BE or main FE Branch

```bash
# Example: Merge feature to BE
# (Done by backend team maintainer)
git checkout BE
git pull origin BE
git merge BE-RBAC
git push origin BE
```

### 5. Merging to Main Branch

```bash
# Only maintainers do this when BE & FE are stable
git checkout main
git pull origin main
git merge BE        # and/or: git merge FE

git push origin main
```

---

## Switching Between Features

### Backend Developer

```bash
git checkout BE-[other-feature]  # switching to another feature branch
```

```bash
# Example: current branch is BE-RBAC and switching to BE-API
git checkout BE-API
```

> Make sure your current feature is committed or stashed before switching.

### Frontend Developer

```bash
git checkout FE-[other-feature]  # switching to another feature branch
```

```bash
# Example: current branch is FE-Component and switching to FE-UI
git checkout FE-UI
```

> ⚠️ Communicate with other frontend members before switching major features to avoid conflicts or UI breaks.

---

## Pull Request (PR) / Merge Review Checklist

* [ ] Feature is complete and tested
* [ ] No console errors or backend failures
* [ ] Code reviewed by at least one peer
* [ ] Branch is up to date with `BE` or `FE`
* [ ] No hardcoded credentials or debug logs

---

## 💡 Suggestions for Better Workflow

* ✅ Use [GitHub Projects](https://github.com/features/project-management/) or a Kanban board to track features
* ✅ Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages (optional but helpful)
* ✅ Automate testing or linting using GitHub Actions (CI/CD)
* ✅ Schedule regular merge days (e.g. weekly) to keep `main` updated safely

---

## 🙋 Common Git Errors

* **"fatal: not a git repository"** → You are not in a git-initialized folder.
* **"Merge conflict"** → Resolve conflict manually or with VSCode Git tools.
* **"rejected - non-fast-forward"** → Pull first using `git pull --rebase`.

---

Happy coding! 🚀

    es em ge te
    - jiko