# Organization invite

The email Nulvless sends when a member invites someone to an organization. This
is the default the platform uses until you replace it; start from this file to
match your brand.

Subject: `You’re invited to {{platform.name}}`

| Variable | Value |
| --- | --- |
| `{{message}}` | The personal message written by whoever sent the invite, empty when there is none |
| `{{platform.name}}` | Your project name |
| `{{redirect_uri}}` | The link the user follows; the platform builds it |

## Use it

In the console, open **Communications → Templates** for the environment, choose
`grants-invite`, and paste the contents of `en-US.html`. Keep the variables: the
platform fills them in when it sends the email.

To send it in another language, add the same template for that language, such as
`pt-BR`.