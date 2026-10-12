# Dhemaji Engineering College - Student Resource Portal 🎓

A modern, minimal web portal for students of Dhemaji Engineering College to browse, filter, and share academic resources (Notes, PYQs, etc.) by Engineering Branch and Semester.

## 🛠️ Tech Stack
- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Backend / Database / Auth:** Supabase (PostgreSQL + Row-Level Security)
- **Deployment:** Cloudflare Pages

---

## 🚀 Getting Started for Developers

### 1. Clone the repository
```bash
git clone https://github.com/your-username/dec-portal.git
cd dec-portal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Fill in your Supabase project URL and anon public key in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure
```text
dec-portal/
├── public/              # Static assets (college logo, redirects)
├── src/
│   ├── components/      # UI components (Navbar, Loader, ProtectedRoute)
│   ├── context/         # AuthContext provider
│   ├── lib/             # Supabase client initialization
│   ├── pages/           # Pages (Home, Browse, Submit, Profile)
│   │   ├── admin/       # Admin Dashboard & Login
│   │   └── auth/        # Student Login & Signup
│   ├── App.jsx          # Routes
│   └── index.css        # Tailwind styles & theme
├── supabase/            # Database schema & setup SQL scripts
├── .env.example         # Template for environment variables
└── package.json
```
