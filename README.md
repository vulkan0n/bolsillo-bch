# Selene Wallet

Your Gateway to the Cash Economy.

Website: https://selene.cash

We are fulfilling the mission of making Bitcoin Cash (BCH) the [global reserve currency](https://bitcoincashpodcast.com/faqs/Podcast/what-do-you-mean-global-reserve-currency) by building a sleek, robust, user-friendly wallet that makes joining the BCH economy as easy and compelling as possible.

## Demo

- Coming soon

## Developer Quick Start

1. `git clone https://git.xulu.tech/selene.cash/selene-wallet`
2. `cd selene-wallet`
3. `yarn install`
4. `yarn run build`
5. `yarn dev`
6. https://localhost:5173

## Building for Android

1. Install Android Studio
2. `yarn run build`
3. `npx cap sync`
4. `npx cap run android`
5. (optional) `npx cap open android` to open the app in android studio

## Building for iOS

1. Install Xcode
2. `yarn run build`
3. `npx cap sync`
4. `npx cap run ios`
5. (optional) `npx cap open ios` to open the app in Xcode

## Contribution and Contact

Questions: [Telegram group](https://t.me/+MMbV2KEPFt84MDQ8)

Contributors: [Contributing](./docs/CONTRIBUTING.md)

Testers: [Testing document](https://docs.google.com/document/d/1VKXeuwlIPFrudwEBrdtg6zIuC2rSF4QRginuq3C_-ro/edit?usp=sharing)

## For merging from PRs to mirror

```
$ git remote add gitlabMirror https://gitlab.com/selene.cash/selene-wallet.git
# Replace the merge request number & choose a branch name
$ git fetch gitlabMirror merge-requests/1111111/head:MY_NEW_BRANCH
# Now that branch is local and can be merged as usual
$ git merge MY_NEW_BRANCH
```
