# thesis

## Deploy auth checklist

Frontend environment variables:

- `VITE_API_BASE_URL`: backend URL, for example `https://api.example.com`
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Web client ID

Backend environment variables:

- `FRONTEND_URL`: frontend URL, for example `https://www.example.com`
- `GOOGLE_CLIENT_ID`: the same Google OAuth Web client ID used by the frontend
- `JWT_SECRET`: long random secret

Google Cloud Console OAuth client:

- Add the deployed frontend domain to **Authorized JavaScript origins**.
- Keep the backend `GOOGLE_CLIENT_ID` matched with the frontend `VITE_GOOGLE_CLIENT_ID`.

Create or reset the production admin:

```bash
cd backend/server
ADMIN_EMAIL=admin01@unieed.com ADMIN_PASSWORD='your-strong-password' npm run create-admin
```
