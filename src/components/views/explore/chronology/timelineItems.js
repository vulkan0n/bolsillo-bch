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

const FLIPSTARTER_READ_MORE_URL = "https://flipstarter.cash/"
const FLIPSTARTER_GRAPHIC_URL = "https://flipstarter.cash/static/img/logo-alt.svg"

const CASHSCRIPT_READ_MORE_URL = "https://cashscript.org/"
const CASHSCRIPT_VIDEO_URL = "https://www.youtube.com/watch?v=5fsqU0lvA8c"

const JOGS_READ_MORE_URL = "https://jogs.one/"

const UAHF_READ_MORE_URL = "https://bitcoincashpodcast.com/start#episode-8-of-10-bitcoin-cash"

export const CATEGORIES = {
  FORK: {
    FORK: "Protocol Upgrade",
    HARD_FORK: "Hard Fork",
    SOFT_FORK: "Soft Fork"
  },
  CONFERENCE: "Conference",
  PROJECT_LAUNCH: "Project Launch",
  INFRASTRUCTURE: "Developer Tools & Infrastructure"
}

const UPGRADES = [
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
    title: "UAHF - BCH/BTC Split",
    date: DateTime.fromISO("2017-08-01"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      "Mired in the chaos of The Blocksize War, big blockers take a stand & split the original Bitcoin into separate BTC & BCH chains.",
      "UAHF stands for User Activated Hard Fork."
      "The initial upgrade raised the blocksize from 1MB to 8MB & pre-empted the incoming (unwanted) SegWit changes later added with a UASF (Soft fork) to the BTC side.",
    ],
    readMoreUrl: UAHF_READ_MORE_URL
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
]

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

const INFRASTRUCTURE = [
  {
    title: "CashScript",
    date: DateTime.fromISO("2019-07-01"), // July 2019, check exact date
    category: CATEGORIES.INFRASTRUCTURE,
    videoUrl: CASHSCRIPT_VIDEO_URL,
    graphicUrl: null,
    description: [
      "Higher-level language compiler for programmers building Bitcoin Cash smart contracts.",
    ],
    readMoreUrl: CASHSCRIPT_READ_MORE_URL
  },
]

const PROJECTS = [
  {
    title: "Flipstarter",
    date: DateTime.fromISO("2020-03-01"), // March 2020, check exact date
    category: CATEGORIES.PROJECT_LAUNCH,
    videoUrl: null,
    graphicUrl: FLIPSTARTER_GRAPHIC_URL,
    description: [
      "Non-custodial, open-source, on-chain crowdfunding allowing BCH projects to bootstrap from community funding.",
    ],
    readMoreUrl: FLIPSTARTER_READ_MORE_URL
  },
  {
    title: "Journal of Global Surgery",
    date: DateTime.fromISO("2021-06-01"), // June 2021, check exact date
    category: CATEGORIES.PROJECT_LAUNCH,
    videoUrl: null,
    graphicUrl: null,
    description: [
      "Peer-reviewed medical journal with a unique publishing model.",
      "Journal articles are accessed by BCH micropayments & articles become public once cost of research is recouped.",
    ],
    readMoreUrl: JOGS_READ_MORE_URL
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
]

const TIMELINE_ITEMS = [
  ...CONFERENCES,
  ...UPGRADES,
  ...PROJECTS,
  ...INFRASTRUCTURE
].sort((a, b) => a.date - b.date)

export default TIMELINE_ITEMS