# SMS verification code

The SMS Nulvless sends when a user must confirm a phone number or sign in with a
code. This is the default the platform uses until you replace it; start from
this file to match your brand.

| Variable | Value |
| --- | --- |
| `{{code}}` | The one-time code |
| `{{platform.name}}` | Your project name |

## Use it

In the console, open **Communications → Templates** for the environment, choose
`phone-otp-verification`, and paste the contents of `en-US.txt`. Keep the
variables: the platform fills them in when it sends the SMS.

Keep it under 320 characters after the variables are filled in.

To send it in another language, add the same template for that language, such as
`pt-BR`.