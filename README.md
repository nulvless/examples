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
- **Communication templates** (`templates/`) are the emails and SMS Nulvless
  sends for you, such as verification codes and password resets. Start from
  them to match your brand in **Communications → Templates**.

The CLI reads `catalog.json` from this repository, so an example merged here is
available to everyone right away, without a new CLI release.

## Examples

<!-- catalog:start -->
### Edge Functions

| Example | What it does | Install |
| --- | --- | --- |
| [count-tokens](functions/count-tokens) | Counts the tokens of a text with tiktoken compiled to WebAssembly, before you send it to a model. | `nulvless functions new <slug> --template count-tokens` |
| [express-app](functions/express-app) | Runs an existing Express app as an Edge Function, with its routes and middleware unchanged. | `nulvless functions new <slug> --template express-app` |
| [hash-upload](functions/hash-upload) | Reads a large upload as a stream and computes its SHA-256 without holding the file in memory. | `nulvless functions new <slug> --template hash-upload` |
| [hello](functions/hello) | The smallest Edge Function: reads a query parameter and answers with JSON. | `nulvless functions new <slug> --template hello` |
| [hono-router](functions/hono-router) | A small REST API with several routes in one Edge Function, built with Hono. | `nulvless functions new <slug> --template hono-router` |
| [mandelbrot](functions/mandelbrot) | Draws the Mandelbrot set as text, to see how much plain computation fits in one request. | `nulvless functions new <slug> --template mandelbrot` |
| [require-role](functions/require-role) | Lets a request through only when the user holds one of the given roles in an organization. | `nulvless functions new <slug> --template require-role` |
| [send-email](functions/send-email) | Sends one of your email templates to the signed-in user, never to an address from the request. | `nulvless functions new <slug> --template send-email` |
| [server-sent-events](functions/server-sent-events) | Pushes named events to the browser over one long response, and stops when the client leaves. | `nulvless functions new <slug> --template server-sent-events` |
| [stream-ai-chat](functions/stream-ai-chat) | Streams Claude's answer to the browser as it is written, only for signed-in users. | `nulvless functions new <slug> --template stream-ai-chat` |
| [stripe-webhook](functions/stripe-webhook) | Receives Stripe events and rejects any request whose signature does not match. | `nulvless functions new <slug> --template stripe-webhook` |
| [upload-files](functions/upload-files) | Receives a multipart form, accepts files by type and size, and reports each one it rejects. | `nulvless functions new <slug> --template upload-files` |
| [validate-input](functions/validate-input) | Checks a JSON body with zod and answers 422 with an error per field when it is wrong. | `nulvless functions new <slug> --template validate-input` |
| [verify-session](functions/verify-session) | Rejects requests without a valid access token from one of your project's users. | `nulvless functions new <slug> --template verify-session` |

### Apps

| Example | What it does | Install |
| --- | --- | --- |
| [api-express-rbac](apps/api-express-rbac) | An Express API that authenticates every request and allows each route only to the roles it names. | `nulvless create <dir> --example api-express-rbac` |
| [auth-nextjs](apps/auth-nextjs) | Sign-in in the browser and a route handler that verifies the user's token on the server. | `nulvless create <dir> --example auth-nextjs` |
| [auth-vue](apps/auth-vue) | A Vue 3 single-page app with sign-in, a guarded route and the signed-in user's profile. | `nulvless create <dir> --example auth-vue` |
| [sign-in-with-nulvless](apps/sign-in-with-nulvless) | A third-party app that signs people in through your project's OAuth Server, with PKCE and no SDK. | `nulvless create <dir> --example sign-in-with-nulvless` |

### Communication templates

| Template | When it is sent | Channel |
| --- | --- | --- |
| [change-email-identity](templates/email/change-email-identity) | Sent with a code that confirms a new email address on an existing account. | email |
| [change-phone-identity](templates/sms/change-phone-identity) | Sent with a code that confirms a new phone number on an existing account. | sms |
| [email-link-verification](templates/email/email-link-verification) | Sent to confirm an email address with a link, at sign-up or when adding an email. | email |
| [email-otp-enable-mfa-request](templates/email/email-otp-enable-mfa-request) | Sent with a code that confirms email as a second sign-in factor. | email |
| [email-otp-verification](templates/email/email-otp-verification) | Sent with a one-time code to confirm an email address or sign in. | email |
| [grants-invite](templates/email/grants-invite) | Sent when someone is invited to an organization, with an optional message. | email |
| [phone-link-verification](templates/sms/phone-link-verification) | Sent with a link that confirms a phone number. | sms |
| [phone-otp-enable-mfa-request](templates/sms/phone-otp-enable-mfa-request) | Sent with a code that confirms SMS as a second sign-in factor. | sms |
| [phone-otp-verification](templates/sms/phone-otp-verification) | Sent with a one-time code to confirm a phone number or sign in. | sms |
| [reset-password-email](templates/email/reset-password-email) | Sent with a link to choose a new password. | email |
| [welcome-user](templates/email/welcome-user) | Sent when an account is created, with a link to get started. | email |
<!-- catalog:end -->

## Run an example

Each folder is self-contained, and its README lists the commands and the
secrets it needs.

```bash
npx @nulvless/cli login
npx @nulvless/cli init --org <org> --project <project>
npx @nulvless/cli functions new hello --template hello
npx @nulvless/cli functions deploy hello
```

Apps run on your machine with the usual `npm install` and `npm run dev`, after
copying `.env.example` to `.env.local` and filling it with your project's keys.

## Use with AI agents

- [`llms.txt`](llms.txt) lists every example with its description, install
  command and README, in the [llms.txt](https://llmstxt.org) format. Give it to
  your agent to pick an example.
- [`catalog.json`](catalog.json) has the same data as JSON, with each example's
  files and secrets.
- [`AGENTS.md`](AGENTS.md) holds the rules for agents that change this
  repository, and [`.agents/skills`](.agents/skills) a skill for adding a new
  example.
- `npx @nulvless/cli docs <path>` prints any page of the Nulvless docs as
  Markdown, so the agent writes against the real API.

## Contributing

New examples and fixes are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md)
for what makes a good example and how to check yours before opening a pull
request.

## License

[MIT No Attribution](LICENSE). Copy any example into your own code without
keeping a copyright notice.
