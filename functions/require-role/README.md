# Require a role

Lets a request through only when the user holds `owner` or `admin` in the
organization passed as `?org=`. The token check and the role check are one call.

## Use it

```bash
nulvless functions new delete-workspace --template require-role
nulvless functions deploy delete-workspace
nulvless secrets set PROJECT_SECRET_KEY --function delete-workspace
```

Change `ALLOWED_ROLES` in `index.ts` to the roles you created under **Roles** in
the console. See [Roles and permissions](https://www.nulvless.com/docs/guides/authorization/rbac).

## Try it

```bash
curl "https://<project>.nulvless.co/functions/delete-workspace?org=acme" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

A user without the role gets `403`.
