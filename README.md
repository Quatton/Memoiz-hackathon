# We Absolutely Have No Idea

31 March - 7 April 2023 \
Build your AI Startup Hackathon. Episode 2

## Database Setup

### For members

We use MySQL on PlanetScale as a primary database. Please connect to the PlanetScale via the CLI

Login to your PlanetScale account

```bash
pscale auth login
pscale org switch wahni
pscale connect hackathon dev
```

Put `mysql://localhost:3306/hackathon` in the `.env` file

Then,

```bash
npx prisma db pull
```

to pull the database schema from PlanetScale.

Optionally, you can use the `npx prisma studio` to view the database schema.

### For non-members

Please set up your database and put the connection string in the `.env` file

## Authentication Setup

Please put in Discord OAuth2 credentials in the `.env` file
And set up `NEXTAUTH_SECRET` according to the `.env.example` file.
