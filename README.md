# Selene

Join the Cash economy.

Software to make Bitcoin Cash (BCH) the global reserve currency.

Target is to build up to 10 million daily active users by making joining the BCH economy (from an economic, social and informational perspective) as easy and compelling as possible.

[NPM packages](https://www.npmjs.com/org/selene-wallet)

[Gitlab source](https://gitlab.com/selene.cash/selene-wallet)

[Docker images](https://hub.docker.com/u/bitcoincashpodcast)

## Design Philosophy

Opinions of this repository.

- **Open source**: Required for trustless use by the community. MIT Licensed.
- **BCH only**: Selene is for Bitcoin Cash users. There are enough generic multicoin wallets, mostly useful to speculators trying to maintain a portfolio of lots of frequently traded coins and they do everything at the price of sucking at everything. Ability to fund or send to external chains (e.g. with Sideshift.ai) could be good, but beyond that other coins are out of scope. Instead that time can be spent on BCH specific apps, integrations and differentiators to make the wallet more compelling both to the BCH community and converts from other coins.
- **JS primary**: We're already fighting one uphill battle against monetary network effects, no need to add another one on the technology front. Not that other languages can't be useful, but they have to be very compelling to justify inclusion.
- **Built by power users, preferred by onboarders**: Selene needs to be simple and intuitive for the users discovering Bitcoin for the very first time. Time to first transaction should be optimised to the bare minimum. Later, effective discoverability should help them naturally grow into power users that need all the customization and options available to more advanced users.
- **Ecosystem integrated**: As with the focus on feature discoverability, Selene should help a new user join the BCH ecosystem at large. Community discussion forums, online media, local meetups, local merchants and so on should be encountered naturally as part of using Selene.

## Development

```
$ lerna bootstrap # Install node_modules for all packages, hoisted to root where shared
# Set `packages/app/src/apolloClient.tsx` to use LOCALHOST_SERVER
# Set `packages/server/.env` to use local DATABASE_URL
```

## Packages

- `@selene-wallet/app`: iOS/Android React Native wallet application in Expo.
- `@selene-wallet/common`: Shared utilities and code. Any modifications to this require recompiling with TypeScript as other packages import from the `dist` folder directly.
- `@selene-wallet/server`: Backend code and stat tracking.
- `@selene-wallet/web`: React app for web frontend.

See README in each package for futher information.

To publish each repo, go into it separately and run `$ npm publish --access=public`, we don't use `lerna publish` at the root level since it apparently doesn't allow individually bumping package versions.

## Tips

### Expo

If starting app from Expo window is giving error:

```
iOS Bundling failed 19ms
Unable to resolve "../../App" from "node_modules/expo/AppEntry.js"
```

Make sure you are running `npx expo start` from inside `$ selene-wallet/packages/app` and not `$ selene-wallet` root!

### Postgres

If local Postgres server is not connecting, you may have generated the database with an older version of Postgres.

See links: [here](https://stackoverflow.com/a/29383787/2792268)

```
# Try to manually start Postgres
$ pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start
# Maybe need to upgrade postgres
$ brew postgresql-upgrade-database
```
