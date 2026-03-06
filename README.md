This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- 📊 **Silsilah Tree Visualization** - Interactive family tree visualization
- 👤 **Profile Pages** - Detailed profile for each family member with AI-generated biography
- ✨ **AI-Powered Bio** - Generate personalized biography using GitHub Models AI
- ➕ **Add Members** - Complex form to add family members with relationships
- 🔍 **Smart Search** - Search family members by name or birthplace

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and fill in:

```env
# Database connection
DATABASE_URL="mysql://user:password@localhost:3306/silsilah_simangunsong"

# GitHub Models API (for AI-generated bio)
GITHUB_TOKEN="ghp_your_github_token_here"
```

**To get GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "Silsilah AI Bio"
4. Select scopes: `read:user`, `repo`
5. Click "Generate token" and copy it to your `.env` file

### 3. Setup Database

Make sure MySQL is running, then:

```bash
# Push schema to database
npx prisma db push

# (Optional) Seed initial data
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
