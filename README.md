![Nulvless Examples Header](./examples-cover.png)

Edge Functions and apps built on [Nulvless](https://www.nulvless.com), ready to
copy into your project. Every example here is installable with the
[Nulvless CLI](https://github.com/nulvless/cli):

```bash
npx @nulvless/cli examples
```

- **Edge Functions** (`functions/`) drop into an existing project:
  `nulvless functions new <slug> --template <example>`.
- **Apps** (`apps/`) start a new one: `nulvless create <dir> --example <example>`.

The CLI reads `catalog.json` from this repository, so an example merged here is
available to everyone right away, without a new CLI release.

## Examples

<!-- catalog:start -->
### Edge Functions

| Example | What it does | Install |
| --- | --- | --- |
| [hello](functions/hello) | The smallest Edge Function: reads a query parameter and answers with JSON. | `nulvless functions new <slug> --template hello` |
| [require-role](functions/require-role) | Lets a request through only when the user holds one of the given roles in an organization. | `nulvless functions new <slug> --template require-role` |
| [send-email](functions/send-email) | Sends one of your email templates to the signed-in user, never to an address from the request. | `nulvless functions new <slug> --template send-email` |
| [stripe-webhook](functions/stripe-webhook) | Receives Stripe events and rejects any request whose signature does not match. | `nulvless functions new <slug> --template stripe-webhook` |
| [verify-session](functions/verify-session) | Rejects requests without a valid access token from one of your project's users. | `nulvless functions new <slug> --template verify-session` |

### Apps

| Example | What it does | Install |
| --- | --- | --- |
| [api-express-rbac](apps/api-express-rbac) | An Express API that authenticates every request and allows each route only to the roles it names. | `nulvless create <dir> --example api-express-rbac` |
| [auth-nextjs](apps/auth-nextjs) | Sign-in in the browser and a route handler that verifies the user's token on the server. | `nulvless create <dir> --example auth-nextjs` |
| [auth-vue](apps/auth-vue) | A Vue 3 single-page app with sign-in, a guarded route and the signed-in user's profile. | `nulvless create <dir> --example auth-vue` |
| [sign-in-with-nulvless](apps/sign-in-with-nulvless) | A third-party app that signs people in through your project's OAuth Server, with PKCE and no SDK. | `nulvless create <dir> --example sign-in-with-nulvless` |
<!-- catalog:end -->

## Contributing

New examples and fixes are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md)
for what makes a good example and how to check yours before opening a pull
request.

## License

[MIT No Attribution](LICENSE). Copy any example into your own code without
keeping a copyright notice.
