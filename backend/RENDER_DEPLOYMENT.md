# Render Deployment Configuration

This is the production configuration for deploying to Render.

## Services

### 1. PostgreSQL Database (privacy-policy-db)
- Type: PostgreSQL
- Plan: Free
- Region: Germany (EU)
- Database name: privacy_policy
- Auto-backups: Enabled

### 2. Backend Web Service (privacy-policy-backend)
- Type: Node.js
- Plan: Free
- Runtime: Node 18+
- Root Directory: backend

## Environment Variables for Backend

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@internal-dpg-xxxxx.render.com:5432/privacy_policy
JWT_SECRET=your_secure_jwt_secret_here
GOOGLE_API_KEY=your_google_api_key_here
FRONTEND_URL=https://your-app.vercel.app
```

## Build Configuration

**Build Command:**
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

**Start Command:**
```bash
npm start
```

## Health Check

The service includes a health check endpoint:
```
GET https://privacy-policy-backend.onrender.com/health
```

## Database Migrations

Migrations are automatically run during the build process via the `npx prisma migrate deploy` command.

To manually run migrations after deployment:
1. SSH into the service (if available)
2. Run: `npx prisma migrate deploy`

## Debugging

### View Logs
1. Render Dashboard → Service → Logs
2. Filter by level (error, warn, info)

### Database Connection Issues
1. Check DATABASE_URL format
2. Verify Render Database status
3. Check connection limits

### Build Failures
1. Check `npm install` output
2. Verify `prisma generate` succeeds
3. Check migration compatibility

## Auto-spin Down

Free tier services auto-spin down after 15 minutes of inactivity. The first request after spin-down may take 30-60 seconds.

**To avoid this:** Upgrade to Starter plan ($7/month)

## Scaling

Current setup uses Free plan which is suitable for:
- Development
- Testing
- Low-traffic production
- Learning

**For production traffic upgrade to:**
- Starter: $7/month
- Standard: $25+/month
- Professional: Custom pricing

## Monitoring

- Check logs regularly: `Logs` tab
- Monitor database: `Metrics` tab
- Set up error alerts in service settings

## Secrets Management

All sensitive values are stored in environment variables:
- JWT_SECRET
- GOOGLE_API_KEY
- DATABASE_URL

These are never committed to git and are managed securely by Render.
