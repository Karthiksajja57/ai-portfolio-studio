#  AI Portfolio Studio

A modern, full-stack web application designed to help users instantly generate, edit, and publish professional portfolios using Artificial Intelligence. 

**Live Demo:** [AI Portfolio Studio](https://ai-portfolio-studio-qlfu.vercel.app)

##  Key Features

* ** Secure Authentication:** Integrated user sign-up and login utilizing Supabase Auth.
* ** AI-Powered Generation:** Automated creation of professional bios, project descriptions, and skill tags.
* ** Real-Time Builder:** Interactive portfolio editor featuring auto-save functionality and state management.
* ** Live Preview Engine:** Toggleable split-view for testing both Desktop and Mobile responsiveness in real-time.
* ** Dynamic Public Routing:** Custom public URLs (`/p/:slug`) for sharing published portfolios seamlessly.

##  Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (Styling & UI)
* Framer Motion (Animations)
* React Router DOM (Dynamic Routing)
* TanStack Query (Data fetching & caching)
* Lucide React (Icons)

**Backend & Database:**
* Supabase (PostgreSQL, Auth, Edge Functions)

**Deployment:**
* Vercel (CI/CD pipeline and Serverless routing)

## ⚙️ Local Development Setup

To run this project locally on your machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Karthiksajja57/ai-portfolio-studio.git](https://github.com/Karthiksajja57/ai-portfolio-studio.git)
Navigate to the directory:

Bash
cd ai-portfolio-studio
Install dependencies:

Bash
npm install
Set up Environment Variables:
Create a .env file in the root directory and add your Supabase keys:

Code snippet
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Start the development server:

Bash
npm run dev
 Technical Highlights
Vercel Routing: Implemented vercel.json rewrite rules to handle Single Page Application (SPA) dynamic routes.

Database Alignment: Ensured synchronized schema mapping between frontend routing parameters and Supabase backend queries to handle public portfolio delivery.

Developed by S Dinesh Karthik.
