# MySQL database

The preferred setup is:

```powershell
cd backend
.\setup.ps1
```

This creates `jg_placement_portal`, creates all 22 tables through Django's schema editor, and seeds demo data.

Manual database creation, if needed:

```sql
CREATE DATABASE IF NOT EXISTS jg_placement_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
