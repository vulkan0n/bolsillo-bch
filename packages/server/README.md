# `@selene-wallet/server`

## Getting Started

```
$ npx ts-node index.js
# Apollo GraphQL sandbox available at http://localhost:4000/

# Database setup with Postgres & Prisma
$ createdb selene-wallet
# Make a copy of .env-example called .env

# Fill out with the correct values
# Ask a team member for values

DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"

locally will be something like:

DATABASE_URL="postgresql://<Username>:<Username>@localhost:5432/selene-wallet?schema=public"

$ npx prisma generate
$ npx prisma migrate dev
$ npx prisma studio # Database browseable at http://localhost:5555
```
