# SMS verification link

The SMS Nulvless sends when a user must confirm a phone number and your project
confirms with a link. This is the default the platform uses until you replace
it; start from this file to match your brand.

| Variable | Value |
| --- | --- |
| `{{platform.name}}` | Your project name |
| `{{redirect_uri}}` | The link the user follows; the platform builds it |

## Use it

In the console, open **Communications → Templates** for the environment, choose
`phone-link-verification`, and paste the contents of `en-US.txt`. Keep the
variables: the platform fills them in when it sends the SMS.

Keep it under 320 characters after the variables are filled in.

To send it in another language, add the same template for that language, such as
`pt-BR`.