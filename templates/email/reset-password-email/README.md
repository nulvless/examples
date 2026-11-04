# Password reset email

The email Nulvless sends when a user asks to reset a forgotten password. This is
the default the platform uses until you replace it; start from this file to
match your brand.

Subject: `Reset your password`

| Variable | Value |
| --- | --- |
| `{{platform.name}}` | Your project name |
| `{{redirect_uri}}` | The link the user follows; the platform builds it |

## Use it

In the console, open **Communications → Templates** for the environment, choose
`reset-password-email`, and paste the contents of `en-US.html`. Keep the
variables: the platform fills them in when it sends the email.

To send it in another language, add the same template for that language, such as
`pt-BR`.