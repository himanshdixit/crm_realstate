# Super Admin Creation Guide

This project includes a secure bootstrap script that creates one active, email-verified user with the `super-admin` system role and all configured CRM permissions.

## 1. Ensure MongoDB is running

From PowerShell:

```powershell
sc.exe query MongoDB
```

The MongoDB service state must be `RUNNING`.

## 2. Open the backend project

```powershell
cd "F:\AI Projects mine\codex-realestate\backend"
```

## 3. Configure the database

Confirm that `backend/.env` contains:

```env
MONGODB_URL=mongodb://127.0.0.1:27017
DB_NAME=Codex_realstate_db
```

`MONGODB_URL` contains only the MongoDB server address. The database name is configured separately through `DB_NAME`.

## 4. Configure the Super Admin identity

Add the following values to `backend/.env`, replacing the examples with the credentials you want to use:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourStrongPassword123
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Administrator
```

The password must have at least 10 characters and include:

- One lowercase letter
- One uppercase letter
- One number

Never commit the real `.env` file or administrator password to Git.

## 5. Seed permissions and roles

Run:

```powershell
npm.cmd run seed
```

This synchronizes the system permissions and roles, including the required `super-admin` role. It is safe to run the reference-data seeder again when permissions change.

## 6. Create the Super Admin

Run:

```powershell
npm.cmd run seed:admin
```

The script creates the user with:

- The `super-admin` role
- Active account status
- Email already marked as verified
- All permissions assigned through the system role
- A securely hashed password

The command should report `Super administrator created`.

## 7. Start the backend

```powershell
npm.cmd run dev
```

Keep the terminal open. Verify the API and database connection at:

```text
http://localhost:5000/api/v1/health/ready
```

## 8. Start the frontend

Open another PowerShell terminal and run:

```powershell
cd "F:\AI Projects mine\codex-realestate\frontend"
npm.cmd run dev
```

Open the login page:

```text
http://localhost:3000/login
```

Sign in using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `backend/.env`.

## Troubleshooting

### Super Admin role is missing

Run the role and permission seeder before creating the administrator:

```powershell
npm.cmd run seed
npm.cmd run seed:admin
```

### A user with ADMIN_EMAIL already exists

The bootstrap script intentionally does not overwrite an existing account. Sign in with that account or configure a different `ADMIN_EMAIL`. Do not delete a production administrator merely to rerun the bootstrap command.

### EADDRINUSE on port 5000

Another backend process is already using port 5000. Use the running instance or stop it before starting another backend. This is a port conflict, not a MongoDB connection error.

To identify the listener:

```powershell
netstat -ano | Select-String ':5000.*LISTENING'
```

### MongoDB connection failure

Confirm the Windows service and API readiness:

```powershell
sc.exe query MongoDB
Invoke-RestMethod http://localhost:5000/api/v1/health/ready
```

The readiness response should report database status `up` and state `1`.
