const CASHTOKENS_EXPLANER_VIDEO_URL = "https://www.youtube.com/watch?v=uIhQKQ4efnQ"
const CASHTOKENS_FAQ_URL = "https://bitcoincashpodcast.com/faqs/Tech/what-is-cashtokens"

const ABLA_EXPLAINER_VIDEO_URL = "https://www.youtube.com/watch?v=YkkzIjZQNH0"
const ABLA_FAQ_URL = "https://bitcoincashpodcast.com/faqs/BCH/what-is-the-maximum-bch-blocksize"

const BLISS_FAQ_URL = "https://bitcoincashpodcast.com/faqs/Events/BLISS"

const BITCOIN_CASH_PODCAST_GRAPHIC_URL = "https://bitcoincashpodcast.com/sunglasses.jpg"
const BITCOIN_CASH_PODCAST_URL = "https://bitcoincashpodcast.com/"

export const CATEGORIES = {
  FORK: {
    FORK: "Protocol Upgrade",
    HARD_FORK: "Hard Fork",
    SOFT_FORK: "Soft Fork"
  },
  CONFERENCE: "Conference",
  PROJECT_LAUNCH: "Project Launch"
}

const TIMELINE_ITEMS = [
  {
    title: "OP_CHECKSEQUENCEVERIFY",
    date: "4th July 2016",
    category: CATEGORIES.FORK.SOFT_FORK,
    videoUrl: null,
    description: [
      "Addition of OP_CHECKSEQUENCEVERIFY.",
    ],
    readMoreUrl: null
  },
  {
    title: "The Bitcoin Cash Podcast",
    date: "23rd January 2021",
    category: CATEGORIES.PROJECT_LAUNCH,
    videoUrl: null,
    graphicUrl: BITCOIN_CASH_PODCAST_GRAPHIC_URL,
    description: [
      "The Bitcoin Cash Podcast publishes its first piece of BCH content with the release of Episode 1.",
    ],
    readMoreUrl: BITCOIN_CASH_PODCAST_URL
  },

  {
    title: "CashTokens",
    date: "15th May 2023",
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: CASHTOKENS_EXPLANER_VIDEO_URL,
    description: [
      "Protocol native CashTokens added to BCH, allowing for smart-contracts, fungible tokens & non-fungible tokens directly validated by the network.",
    ],
    readMoreUrl: CASHTOKENS_FAQ_URL
  },
  {
    title: "BLISS",
    date: "14th May 2023",
    category: CATEGORIES.CONFERENCE,
    videoUrl: null,
    description: [
      "Conference held in Ljubljana, Slovenia 14th - 15th May 2024.",
      "Arranged to celebrate the ABLA upgrade, present on industry thinking & for community networking.",
    ],
    readMoreUrl: BLISS_FAQ_URL
  },
  {
    title: "ABLA",
    date: "15th May 2024",
    subtitle: "Adjustable Blocksize Limit Algorithm",
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: ABLA_EXPLAINER_VIDEO_URL,
    description: [
      "BCH's 32 MB blocksize limit replaced with a new adjustable limit that scales with and responds intelligently to live network traffic.",
      "Upgrade was celebrated at BCH BLISS in Ljubljana, Slovenia."
    ],
    readMoreUrl: ABLA_FAQ_URL
  }
]

export default TIMELINE_ITEMS