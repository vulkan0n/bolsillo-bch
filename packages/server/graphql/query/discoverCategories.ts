const DEVS_AND_BUILDERS_TELEGRAM = {
  name: "BCH Devs & Builders",
  description: "Find engineering resources and help.",
  url: "https://t.me/bchbuilders",
};

const discoverCategories = [
  {
    name: "Essential",
    description:
      "The best of Bitcoin. Foundational resources and knowledge for all Bitcoiners.",
    items: [
      {
        name: "The Bitcoin Whitepaper",
        description: "Satoshi Nakamoto's original description of Bitcoin.",
        url: "https://bitcoincashpodcast.com/bitcoin.pdf",
      },
    ],
  },
  {
    name: "Telegram Groups",
    description: "Discuss Bitcoin Cash.",
    items: [
      {
        name: "Bitcoin Cash",
        description: "General Bitcoin Cash (non price) discussion.",
        url: "https://t.me/bchchannel",
      },
      {
        name: "BCH (Big Costco Hotdog) Price talk",
        description: "Price and general Bitcoin Cash / hotdog discussion.",
        url: "https://t.me/bchpricechannel",
      },
      {
        name: "Bitcoin Cash Podcast",
        description: "Discuss with listeners of The Bitcoin Cash Podcast.",
        url: "https://t.me/thebitcoincashpodcast_discussion",
      },
      {
        ...DEVS_AND_BUILDERS_TELEGRAM,
      },
      {
        name: "SmartBCH",
        description: "Chat about the SmartBCH sidechain",
        url: "https://t.me/smartbch_community",
      },
      {
        name: "BCH Argentina",
        description: "Charlar sobre BCH en Español.",
        url: "https://t.me/BCHArgentina",
      },
    ],
  },
  {
    name: "Full nodes",
    description:
      "Software that propogates and validates transactions for Bitcoin miners and nodes.",
    items: [
      {
        name: "BCHN (Bitcoin Cash Node)",
        description:
          "A professional, miner-friendly node that solves practical problems for Bitcoin Cash. Currently the most popular node implementation.",
        url: "https://bitcoincashnode.org/en/",
      },
      {
        name: "Bitcoin Verde",
        description: "A Bitcoin Cash full-node written in Java.",
        url: "https://bitcoinverde.org/",
      },
      {
        name: "Bitcoin Unlimited (BU)",
        description:
          "The Peer-to-Peer Electronic Cash System for Planet Earth.",
        url: "https://www.bitcoinunlimited.info/",
      },
      {
        name: "BCHD",
        description:
          "A mature, full node implementation of the Bitcoin Cash protocol written in Go.",
        url: "https://bchd.cash/",
      },
      {
        name: "Knuth",
        description: "High performance Bitcoin development platform.",
        url: "https://github.com/k-nuth/kth",
      },
      {
        name: "Flowee",
        description:
          "Flowee is a family of products and our goal is to move the world towards a Bitcoin Cash economy.",
        url: "https://flowee.org/",
      },
    ],
  },
  {
    name: "Engineering Resources",
    description: "Start building on Bitcoin Cash.",
    items: [
      {
        ...DEVS_AND_BUILDERS_TELEGRAM,
      },
      {
        name: "Developers.cash",
        description:
          "Useful developer resources for building the Internet of Cash.",
        url: "https://developers.cash/",
      },
      {
        name: "Reference.cash",
        description: "Bitcoin Cash protocol specification reference.",
        url: "https://reference.cash/",
      },
      {
        name: "Libauth",
        description:
          " An ultra-lightweight JavaScript library for Bitcoin, Bitcoin Cash, and Bitauth applications.",
        url: "https://github.com/bitauth/libauth",
      },
      {
        name: "Chaingraph API",
        description:
          "Chaingraph is a multi-node blockchain indexer and GraphQL API.",
        url: "https://chaingraph.cash/",
      },
      {
        name: "Mainnet.cash",
        description:
          " Develop using Bitcoin Cash in JS or Python, Go, PHP, Ruby, etc - via REST.",
        url: "https://mainnet.cash/",
      },
      {
        name: "Bitcoin Cash Site / build",
        description: "Collection of Bitcoin Cash building tools.",
        url: "https://bitcoincashsite.com/build/",
      },
      {
        name: "Fullstack.cash",
        description:
          "Adaptation of Mastering Bitcoin by Andreas Antonopoulos for technical reference to working with the Bitcoin Cash protocol.",
        url: "https://fullstack.cash/documentation/",
      },
      {
        name: "Mastering Bitcoin Cash",
        description:
          "Alternative adaptation of Mastering Bitcoin by Andreas Antonopoulos.",
        url: "https://zh.thedev.id/mastering-bitcoin-cash/",
      },
      {
        name: "CashStack",
        description: "A JavaScript Framework for Sovereign Money and Data.",
        url: "https://permissionless-software-foundation.github.io/cashstack.info/",
      },
      {
        name: "Electrum Cash Protocol",
        description:
          "Electrum Cash Protocol¶ reference for client and server authors.",
        url: "https://bitcoincash.network/electrum/",
      },
      {
        name: "Awesome Bitcoin Cash",
        description: "A curated list of Bitcoin Cash projects & resources.",
        url: "https://github.com/2qx/awesome-bitcoin-cash",
      },
      {
        name: "Unspent",
        description:
          "Decentralized finance using unspent transaction unlocking script. Open source, on-chain, running nativiely & directly on Bitcoin Cash (BCH).",
        url: "https://unspent.app/",
      },
      {
        name: "CashScript Tutorial Series",
        description:
          "Learn how to write your very first Bitcoin Cash (BCH) smart contract!",
        url: "https://www.youtube.com/watch?v=uzzUEQSKTh4",
      },
    ],
  },
  {
    name: "Governance",
    description: "Bitcoin Cash network direction and consensus.",
    items: [
      {
        name: "FAQ on Network Governance",
        description: "Summary of BCH Network Governance.",
        url: "https://bitcoincashpodcast.com/faqs/BCH/how-does-BCH-governance-work",
      },
      {
        name: "CHIPs",
        description: "Cash Improvement Proposal documents.",
        url: "https://bch.info/en/chips",
      },
      {
        name: "Bitcoin Cash Network Discussions",
        description:
          "Professional meetings. Practical topics. Productive dialogues.",
        url: "https://bitcoincashnetworkdiscussions.org/",
      },
      {
        name: "Bitcoin Cash Research",
        description:
          "Ongoing discussion and research into protocol upgrade proposals.",
        url: "https://bitcoincashresearch.org/",
      },
    ],
  },
];

module.exports = discoverCategories;
