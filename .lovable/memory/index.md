Finora AI - Project Memory with admin/user roles, light purple theme

## Design System
- Light purple fintech theme: background #F5F4F9, primary purple (258 70% 55%), accent violet (258 90% 66%), success green (142 71% 45%), warning amber, destructive red
- Font: Plus Jakarta Sans (300-800 weights)
- Clean white cards with subtle purple shadows, rounded-2xl corners
- HSL-based CSS variables, light mode only
- Gradient classes: gradient-text, purple-gradient-bg, gradient-surface

## Architecture
- **Auth**: Real Supabase auth via AuthContext with isAdmin flag from user_roles table
- **Roles**: user_roles table with app_role enum (admin/user), has_role() security definer function
- **First user = admin**: Trigger on auth.users insert assigns first user as admin, rest as user
- **Admin Panel**: /admin routes with AdminRoute guard, DashboardLayout accepts isAdmin prop
- **Admin Pages**: Dashboard, User Management, Platform Analytics, Content Moderation, API Logs, Settings
- **User Panel**: /dashboard routes unchanged (Overview, Forecasts, Anomalies, Health, Scenario, Reports, Data Quality, Copilot, Settings)
- **Database**: profiles, spreadsheets, chat_messages, api_logs, user_roles
- **AI Copilot**: Edge function financial-chat, SSE streaming
- **Social Auth**: Google + Apple OAuth via @lovable.dev/cloud-auth-js

## Admin Capabilities
- View/edit/delete all users and their plans
- Platform analytics with charts (plan distribution, API usage, response times, upload distribution)
- Content moderation: view/delete all spreadsheets and chat messages
- API logs viewer with filtering and stats
- Admin can switch between admin panel and user dashboard via sidebar link

## Free Plan Rules
- 1 spreadsheet upload max
- Partial dashboard: first 2 KPIs visible, rest gated
- AI Copilot: 3 free messages then locked
- Forecasts, Scenario Lab, Reports exports: fully gated
