import { DateTime } from "luxon";

const CASHTOKENS_EXPLANER_VIDEO_URL = "https://www.youtube.com/watch?v=uIhQKQ4efnQ"
const CASHTOKENS_FAQ_URL = "https://bitcoincashpodcast.com/faqs/Tech/what-is-cashtokens"

const ABLA_EXPLAINER_VIDEO_URL = "https://www.youtube.com/watch?v=YkkzIjZQNH0"
const ABLA_FAQ_URL = "https://bitcoincashpodcast.com/faqs/BCH/what-is-the-maximum-bch-blocksize"

const BLISS_FAQ_URL = "https://bitcoincashpodcast.com/faqs/Events/BLISS"

const BCH22_STREAM_URL = "https://www.youtube.com/watch?v=1W0-N_0K6jQ"
const BCH22_FAQ_URL = "https://bitcoincashpodcast.com/faqs/Events/BCH22"

const BITCOIN_CASH_PODCAST_GRAPHIC_URL = "https://bitcoincashpodcast.com/sunglasses.jpg"
const BITCOIN_CASH_PODCAST_URL = "https://bitcoincashpodcast.com/"

const BCH_CITY_VIDEO_URL = "https://www.youtube.com/watch?v=UuhH1lL6BAw"

export const CATEGORIES = {
  FORK: {
    FORK: "Protocol Upgrade",
    HARD_FORK: "Hard Fork",
    SOFT_FORK: "Soft Fork"
  },
  CONFERENCE: "Conference",
  PROJECT_LAUNCH: "Project Launch"
}

const CONFERENCES = [
  {
    title: "Bitcoin Cash City Conference",
    date: DateTime.fromISO("2019-09-04"),
    category: CATEGORIES.CONFERENCE,
    videoUrl: BCH_CITY_VIDEO_URL,
    description: [
      "Conference held in the 'Bitcoin Cash City' Townsvile, Australia 4th - 5th September 2019.",
      "Only 2 years after the split from BTC, the BCH community converged to assess the state of the revolution.",
    ],
    readMoreUrl: null
  },
  {
    title: "BCH22",
    date: DateTime.fromISO("2022-11-12"),
    category: CATEGORIES.CONFERENCE,
    videoUrl: BCH22_STREAM_URL,
    description: [
      "Conference held in St Kitts 12th - 13th November 2023.",
      "Arranged to experience the impressive BCH adoption on the island & discuss the future of BCH.",
    ],
    readMoreUrl: BCH22_FAQ_URL
  },
  {
    title: "BLISS",
    date: DateTime.fromISO("2024-05-14"),
    category: CATEGORIES.CONFERENCE,
    videoUrl: null,
    description: [
      "Conference held in Ljubljana, Slovenia 14th - 15th May 2024.",
      "Arranged to celebrate the ABLA upgrade, discuss industry thinking & for community networking.",
    ],
    readMoreUrl: BLISS_FAQ_URL
  },
]

const TIMELINE_ITEMS = [
  ...CONFERENCES,
  {
    title: "OP_CHECKSEQUENCEVERIFY",
    date: DateTime.fromISO("2016-07-04"),
    category: CATEGORIES.FORK.SOFT_FORK,
    videoUrl: null,
    description: [
      "Addition of OP_CHECKSEQUENCEVERIFY.",
    ],
    readMoreUrl: null
  },
  {
    title: "The Bitcoin Cash Podcast",
    date: DateTime.fromISO("2021-01-23"),
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
    date: DateTime.fromISO("2023-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: CASHTOKENS_EXPLANER_VIDEO_URL,
    description: [
      "Protocol native CashTokens added to BCH, allowing for smart-contracts, fungible tokens & non-fungible tokens directly validated by the network.",
    ],
    readMoreUrl: CASHTOKENS_FAQ_URL
  },

  {
    title: "ABLA",
    date: DateTime.fromISO("2024-05-15"),
    subtitle: "Adjustable Blocksize Limit Algorithm",
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: ABLA_EXPLAINER_VIDEO_URL,
    description: [
      "BCH's 32 MB blocksize limit replaced with a new adjustable limit that scales with and responds intelligently to live network traffic.",
      "Upgrade was celebrated at BCH BLISS in Ljubljana, Slovenia."
    ],
    readMoreUrl: ABLA_FAQ_URL
  }
].sort((a, b) => a.date - b.date)

export default TIMELINE_ITEMS