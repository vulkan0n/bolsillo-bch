const CASHTOKENS_EXPLANER_VIDEO_URL = "https://www.youtube.com/watch?v=uIhQKQ4efnQ"
const CASHTOKENS_FAQ_URL = "https://bitcoincashpodcast.com/faqs/Tech/what-is-cashtokens"

const ABLA_EXPLAINER_VIDEO_URL = "https://www.youtube.com/watch?v=YkkzIjZQNH0"
const ABLA_FAQ_URL = "https://bitcoincashpodcast.com/faqs/BCH/what-is-the-maximum-bch-blocksize"

const CATEGORIES = {
  HARD_FORK: "Protocol Upgrade (Hard Fork)"
}

const TIMELINE_ITEMS = [
  {
    title: "CashTokens",
    date: "15th May 2023",
    category: CATEGORIES.HARD_FORK,
    videoUrl: CASHTOKENS_EXPLANER_VIDEO_URL,
    description: [
      "Protocol native CashTokens added to BCH, allowing for smart-contracts, fungible tokens & non-fungible tokens directly validated by the network.",
    ],
    readMoreUrl: CASHTOKENS_FAQ_URL
  },
  {
    title: "ABLA",
    date: "15th May 2024",
    subtitle: "Adjustable Blocksize Limit Algorithm",
    category: CATEGORIES.HARD_FORK,
    videoUrl: ABLA_EXPLAINER_VIDEO_URL,
    description: [
      "BCH's 32 MB blocksize limit replaced with a new adjustable limit that scales with and responds intelligently to live network traffic.",
      "Upgrade was celebrated at BCH BLISS in Ljubljana, Slovenia."
    ],
    readMoreUrl: ABLA_FAQ_URL
  }
]

export default TIMELINE_ITEMS