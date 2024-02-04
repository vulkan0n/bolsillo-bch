# Selene Wallet: Join the Cash Economy!

[![Latest Release](https://git.xulu.tech/selene.cash/selene-wallet/-/badges/release.svg)](https://git.xulu.tech/selene.cash/selene-wallet/-/releases)

Website: https://selene.cash

We are fulfilling the mission of making Bitcoin Cash (BCH) the [global reserve currency](https://bitcoincashpodcast.com/faqs/Global-Reserve-Currency/what-do-you-mean-global-reserve-currency) by building a sleek, robust, user-friendly wallet that makes joining the BCH economy as easy and compelling as possible.

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

Questions: [Telegram group](https://t.me/SeleneWallet)

Contributors: [Contributing](./CONTRIBUTING.md)

Testers: [Testing document](https://docs.google.com/document/d/1VKXeuwlIPFrudwEBrdtg6zIuC2rSF4QRginuq3C_-ro/edit?usp=sharing)

## Dev notes

### For merging from PRs to mirror

```
$ git remote add gitlabMirror https://gitlab.com/selene.cash/selene-wallet.git
# Replace the merge request number & choose a branch name
$ git fetch gitlabMirror merge-requests/1111111/head:MY_NEW_BRANCH
# Now that branch is local and can be merged as usual
$ git merge MY_NEW_BRANCH
```

### Archiving on XCode (fixing the build error)
Open Target Support Files -> Pods-App -> Pods-App-Framework.sh.

find this (around line 44):

```
  if [ -L "${source}" ]; then
    echo "Symlinked..."
    source="$(readlink "${source}")"
  fi
```

change the readlink line to `source="$(readlink -f "${source}")"`

### Auto-translations

Manually managing translations got super tiresome & unwieldy with so many languages, so it has been automated.

Translation files are colocated with the file needing the translation strings. The script scans the entire `src` folder for files that begin exactly `const translations = {`. For every found file, it looks in the **second** layer of the object (first is the string identifier) for the "en" key, translates it into every language key we support (skipping any that are already known), and overwrites the original file with the new values included in alphabetical order by language-key.

Start of a translation file sample:

BEFORE:

```
const translations = {
  walletSettings: {
    da: "Indstillinger for Tegnebog",
    de: "Wallet-Einstellungen",
    en: "Wallet Settings",
    es: "Configuración de la billetera",
```

AFTER:

```
const translations = {
  walletSettings: {
    ar: "إعدادات المحفظة",
    bn: "ওয়ালেট সেটিংস",
    da: "Indstillinger for Tegnebog",
    de: "Wallet-Einstellungen",
    el: "Ρυθμίσεις πορτοφολιού",
    en: "Wallet Settings",
    es: "Configuración de la billetera",
    fa: "تنظیمات کیف پول",
```

Translations are done with Google Cloud Translation API. At the moment it's running on free credits, but even after it isn't it probably shouldn't be that expensive. You can run the script to test, it skips over existing translations and only fills in missing translations, but if you're adding new text please don't run up the bill by running it unnecessarily. Decide on the English versions, then run it once to fill everything out.

NOTE: There is a bug in `src/components/views/walletView/WalletViewSend/translations.js` with the "notEnoughFee" key. Before running translation, copy-paste that key into a separate document, run the translation, then afterwards return the "notEnoughFee" key. Also, manually add any new "notEnoughFee" translations. If you don't do this, the entire file will miss out on having its translations updated.

```
# Use a valid API key
$ GOOGLE_TRANSLATE_API_KEY="XXXXXXXXX" node ./automation/addLanguages.js
```
