# Email verification code

The email Nulvless sends when a user must confirm an email address or sign in
with a code. This is the default the platform uses until you replace it; start
from this file to match your brand.

Subject: `Verification code`

| Variable | Value |
| --- | --- |
| `{{code}}` | The one-time code |
| `{{platform.name}}` | Your project name |

## Use it

In the console, open **Communications → Templates** for the environment, choose
`email-otp-verification`, and paste the contents of `en-US.html`. Keep the
variables: the platform fills them in when it sends the email.

To send it in another language, add the same template for that language, such as
`pt-BR`.