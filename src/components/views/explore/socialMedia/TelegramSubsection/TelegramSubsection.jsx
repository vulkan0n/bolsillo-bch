import React from "react";

const TELEGRAM_CHANNELS = [
  {
    header: "General",
    groups: [
      {
        name: "Bitcoin Cash",
        url: "https://t.me/bchchannel"
      },
      {
        name: "The Bitcoin Cash Podcast",
        url: "https://t.me/thebitcoincashpodcast_discussion"
      },
      {
        name: "r/CashTokens",
        url: "https://t.me/rcashtokens"
      },
      {
        name: "BCH Argentina",
        url: "https://t.me/BCHArgentina"
      }
    ]
  },
  {
    header: "Developers & Builders",
    groups: [
      {
        name: "BCH Devs & Builders",
        url: "https://t.me/bchbuilders"
      },
      {
        name: "CashTokens Devs",
        url: "https://t.me/cashtoken_devs"
      },
      {
        name: "BCH Compilers",
        url: "https://t.me/bch_compilers"
      },
      {
        name: "Libauth Devs",
        url: "https://t.me/libauth_devs"
      }
    ]
  },
  {
    header: "Special Interest",
    groups: [
      {
        name: "BCH (Big Costco Hotdog) Price Discussion",
        url: "https://t.me/bchpricechannel"
      },
      {
        name: "Seize The Memes of Promotion",
        url: "https://t.me/BCHMEMES"
      }
    ]
  },
  {
    header: "Projects",
    groups: [
      {
        name: "Selene Wallet",
        url: "https://t.me/SeleneWallet"
      },
      {
        name: "BCH Bull",
        url: "https://t.me/bchbull"
      },
      {
        name: "BCH Guru",
        url: "https://t.me/bch_guru"
      },
      {
        name: "BCHN",
        url: "https://t.me/bitcoincashnode"
      }
    ]
  }
]

export const TelegramSubsection = () => {
  return (
    <div className="px-2 pb-20">
      <div>
        <p>The BCH community has a thriving set of Telegram channels for discussion and collaboration.</p>
        <p>Channels vary by topic, moderation policy, activity & more.</p>
        <p>Lurk or participate in any that interest you!</p>
      </div>
      <hr className="m-2" />
      <div>
        {TELEGRAM_CHANNELS.map(
          category => {
            return (
              <div key={category.header}>
                <span className="text-lg">{category.header}</span>
                <div>
                  {category.groups.map(channel => (
                    <div key={channel.name}>
                      <span>
                        <span>{"- "}</span>
                        <a href={channel.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 decoration-underline">
                          {channel.name}
                        </a>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}