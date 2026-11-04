# Send an email

Sends the `welcome` email template to the user who calls the function. The
address comes from the user's account, never from the request body, so the
function cannot be used to send mail to anyone else.

## Use it

```bash
nulvless functions new send-welcome --template send-email
nulvless functions deploy send-welcome
nulvless secrets set PROJECT_SECRET_KEY --function send-welcome
```

Create a `welcome` template under **Communications → Templates** in the console
first, or change `TEMPLATE` in `index.ts`. The template receives `name`. The
[`welcome-user`](../../templates/email/welcome-user) template is a good starting
point for its HTML.

## Try it

```bash
curl -X POST "https://<project>.nulvless.co/functions/send-welcome" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

```json
{ "sent": true }
```
