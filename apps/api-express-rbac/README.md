# Express API with roles

An Express 5 API where every route says who may call it:

| Route | Who |
| --- | --- |
| `GET /me` | any signed-in user |
| `GET /orgs/:org/reports` | `owner`, `admin` or `member` of `:org` |
| `DELETE /orgs/:org/members/:member` | `owner` or `admin` of `:org` |

`requireAuth` and `requireRole` live in `src/middleware/auth.ts`. Both call
`auth.verify` once: the token check and the role check are the same request.

## Use it

```bash
nulvless create my-api --example api-express-rbac
cd my-api
cp .env.example .env.local
npm install
npm run dev
```

Fill `.env.local` with your project URL and a secret key from **API keys** in
the console. Create the roles under **Roles**, and grant them to users in an
organization.

## Try it

```bash
curl http://localhost:4000/orgs/acme/reports -H "Authorization: Bearer $ACCESS_TOKEN"
```

A user without one of the roles gets `403`.

## Learn more

- [Express guide](https://www.nulvless.com/docs/frameworks/express)
- [Roles and permissions](https://www.nulvless.com/docs/guides/authorization/rbac)
