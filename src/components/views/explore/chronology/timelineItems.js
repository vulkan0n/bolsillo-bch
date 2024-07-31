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

const CW_144_READ_MORE_URL = "https://reference.cash/protocol/forks/hf-20171113"
const MONOLITH_READ_MORE_URL = "https://reference.cash/protocol/forks/hf-20180515"
const MAGNETIC_ANOMALY_READ_MORE_URL = "https://reference.cash/protocol/forks/hf-20181115"
const GREAT_WALL_READ_MORE_URL = "https://reference.cash/protocol/forks/hf-20190515"
const GRAVITON_READ_MORE_URL = "https://reference.cash/protocol/forks/hf-20191115"
const PHONON_READ_MORE_URL = "https://reference.cash/protocol/forks/hf-20200515"
const AXION_READ_MORE_URL = "https://reference.cash/protocol/forks/hf-20201115"
const BIGBLOCKIFTRUE_READ_MORE_URL = "https://reference.cash/protocol/forks/hf-20210515"
const U8_READ_MORE_URL = "https://reference.cash/protocol/forks/hf-20220515"

export const CATEGORIES = {
  FORK: {
    FORK: "Protocol Upgrade",
    HARD_FORK: "Hard Fork",
    SOFT_FORK: "Soft Fork"
  },
  CONFERENCE: "Conference",
  PROJECT_LAUNCH: "Project Launch",
  INFRASTRUCTURE: "Developer Tools & Infrastructure",
  UPCOMING: "Upcoming (Planned / Theoretical)"
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
      "UAHF stands for User Activated Hard Fork.",
      "The initial upgrade raised the blocksize from 1MB to 8MB & pre-empted the incoming (unwanted) SegWit changes later added with a UASF (Soft Fork) to the BTC side.",
    ],
    readMoreUrl: UAHF_READ_MORE_URL
  },
  {
    title: "CW-144",
    date: DateTime.fromISO("2017-11-13"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      "The BCH Difficulty Adjustment Algorithm updated to cw-144 to help it better handle the rapid price & hashrate fluctuations resulting from sharing SHA256 miners with the BTC chain.",
      "Although initially resource intensive to research & implement, this greatly increased BCH resilience in comparison to BTC.",
    ],
    readMoreUrl: CW_144_READ_MORE_URL
  },
  {
    title: "Monolith",
    date: DateTime.fromISO("2018-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      "BCH begins a cadence of 6-monthly upgrades. Two changes are implemented, increased blocksize & extra op-codes.",
      "32 MB blocks: Network capacity raised 4x after sufficient research & testing done to ensure network resilience.",
      "OP_Codes: Several OP_codes (including OP_CAT, OP_DIV) deactivated in 2010 & 2011 are reactivated on BCH after re-examination & redesigning as necessary to restore Bitcoin script functionality.",
    ],
    readMoreUrl: MONOLITH_READ_MORE_URL
  },
  {
    title: "Magnetic Anomaly - BCH/BSV Split",
    date: DateTime.fromISO("2018-11-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      "BCH continues its cadence of 6-monthly upgrades. Two changes are implemented, CTOR & new OP_Codes.",
      "In protest of these changes, the 'Bitcoin Satoshi's Vision' (BSV) community split the chain to follow their own direction after a dramatic 'Hash War' in which they fail to secure control of the BCH chain.",
      "CTOR (Canonical Transaction Ordering): Transaction ordering within a block must conform to an exact sorting by numerically ascending transaction ids. This improves scaling by reducing need to transmit ordering information & improve transaction parallel processing.",
      "OP_CHECKDATASIG & OP_CHECKDATASIGVERIFY: New OP_Codes introduced allowing verification of non-blockchain data, for example oracle messages.",
    ],
    readMoreUrl: MAGNETIC_ANOMALY_READ_MORE_URL
  },
  {
    title: "Great Wall",
    date: DateTime.fromISO("2019-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      "BCH continues its cadence of 6-monthly upgrades. Schnorr signatures added & SegWit coins recovery enabled.",
      "Schnorr signatures: A new cryptographic signature scheme is added for some OP_Codes to resolve 3rd party malleability among other reasons.",
      "SegWit Recovery: Correction of an oversight in the previous upgrade that made SegWit coins unspendable.",
    ],
    readMoreUrl: GREAT_WALL_READ_MORE_URL
  },
  {
    title: "Graviton",
    date: DateTime.fromISO("2019-11-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      "BCH continues its cadence of 6-monthly upgrades.",
      "Schnorr signatures expanded to cover some multisig transactions.",
      "Malleability mitigations that were previously mempool-enforced are moved to the consensus layer.",
    ],
    readMoreUrl: GRAVITON_READ_MORE_URL
  },
  {
    title: "Phonon",
    date: DateTime.fromISO("2020-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      "BCH continues its cadence of 6-monthly upgrades.",
      "OP_REVERSEBYTES added & SigChecks system introduced to better match transaction needs with computing resources consumed."
    ],
    readMoreUrl: PHONON_READ_MORE_URL
  },
  {
    title: "Axion - BCH/XEC Split",
    date: DateTime.fromISO("2020-11-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      "BCH continues its cadence of 6-monthly upgrades with an essential upgrade to its Difficulty Adjustment Algorithm.",
      "After significant community turmoil, prominent developer Amaury Sechet & his BCHABC node team split off into their own coin 'eCash' (XEC). Contention centered on the introduction of a coinbase 'tax' intended to fund developer activity that the BCH community would not tolerate (for essentially installing a financially priviliged central party to the network).",
      "ASERT: The 2017 BCH DAA (CW-144) was encouraging miners to switch frenetically between Bitcoin chains & disrupting BCH confirmation times. To resolve this, a new DAA called ASERT was introduced for additional robustness to changing mining conditions."
    ],
    readMoreUrl: AXION_READ_MORE_URL
  },
  {
    title: "BigBlockIfTrue",
    date: DateTime.fromISO("2021-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      "After the exit of BCHABC in the Axion upgrade, BCH switches to a yearly upgrade cadence under the CHIP process. Two new upgrades are added.",
      "Unconfirmed Transaction Limit Removed: Unconfirmed transaction chains were previously limited to 50 transactions per block. This limit was removed, allowing unlimited length chains. This removed a lot of developer friction for programmers of real-time apps that may chain transactions at high speeds.",
      "Multiple OP_RETURNs: Additional on-chain data flexibility was introduced by removing a restriction of only one OP_RETURN per transaction."
    ],
    readMoreUrl: BIGBLOCKIFTRUE_READ_MORE_URL
  },
  {
    title: "U8",
    date: DateTime.fromISO("2022-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      "Yearly BCH protocol upgrades in May continue. Three new upgrades - introspection, bigger integers & OP_MUL.",
      "Introspection: Covenents were enabled by Magnetic Anomaly in November 2018, but efficiency & ease of use was very low. Introspection OP_Codes added to significantly improve the developer experience & power of BCH smart contract programming.",
      "64 Bit Integers: 32 bit integers were restricting the ease & potential of mathematical operations in smart contracts. The range of usable numbers expanded enormously to 64 bits.",
      "OP_MUL: Mathematics OP_Code re-enabled in parallel with 64 bit integers."
    ],
    readMoreUrl: U8_READ_MORE_URL
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

// Default sort by reverse-chronological
const TIMELINE_ITEMS = [
  ...CONFERENCES,
  ...UPGRADES,
  ...PROJECTS,
  ...INFRASTRUCTURE
].sort((a, b) => b.date - a.date)

export default TIMELINE_ITEMS