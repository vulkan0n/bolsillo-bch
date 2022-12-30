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
];

module.exports = discoverCategories;
