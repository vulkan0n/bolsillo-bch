# Selene Wallet
Join the Cash economy.

Software to make Bitcoin Cash (BCH) the global reserve currency.

Target is to build up to 10 million daily active users by making joining the BCH economy (from an economic, social and informational perspective) as easy and compelling as possible.

## Live Demo
- https://app.selene.cash/

## Developer Quick Start
1. `git clone https://git.xulu.tech/selene.cash/selene-wallet`
2. `cd selene-wallet`
3. `yarn install`
4. `yarn run build`
5. `yarn dev`

## Building for Android
1. Install Android Studio
2. `yarn run build`
3. `npx cap sync`
4. `npx cap run android`

## Building for iOS
- Coming Soon

## Contribution and Contact
Questions: [Telegram group](https://t.me/+MMbV2KEPFt84MDQ8)

Contributors: [Contributing](./docs/CONTRIBUTING.md)

Testers: [Testing document](https://docs.google.com/document/d/1VKXeuwlIPFrudwEBrdtg6zIuC2rSF4QRginuq3C_-ro/edit?usp=sharing)

## Design Philosophy

Opinions of this repository.

- **Open source**: Required for trustless use by the community. MIT Licensed.
- **BCH only**: Selene is for Bitcoin Cash users. There are enough generic multicoin wallets, mostly useful to speculators trying to maintain a portfolio of lots of frequently traded coins. They do everything at the price of sucking at everything. Ability to fund or send to external chains (e.g. with Sideshift.ai) might be a cool integration, but beyond that other coins are out of scope. Instead that time can be spent on BCH specific apps, integrations and differentiators to make the wallet more compelling both to the BCH community and converts from other coins.
- **JS primary**: We're already fighting one uphill battle against monetary network effects, no need to add another one on the technology front. Not that other languages can't be useful, but they have to be very compelling to justify inclusion.
- **Built by power users, preferred by onboarders**: Selene needs to be simple and intuitive for the users discovering Bitcoin for the very first time. Time to first transaction should be optimised to the bare minimum. Later, effective discoverability should help them naturally grow into power users that need all the customization and options that Selene makes available to more advanced users.
- **Ecosystem integrated**: As with the focus on feature discoverability, Selene should help a new user join the BCH ecosystem at large. Community discussion forums, online media, local meetups, local merchants and so on should be encountered naturally as part of using Selene.
