import { DateTime } from "luxon";

import { translate } from "@/util/translations";
import translations from "./translations";

const GENESIS_READ_MORE_URL = "https://blockchair.com/bitcoin-cash/block/0"

const AFOG_GRAPHIC_URL = "https://pbs.twimg.com/profile_images/1719547852722946048/Ap4rOTHp_400x400.jpg"
const AFOG_APP_URL = '/explore/afog'

const BCH_ARGENTINA_CONFERENCE_VIDEO_URL = "https://www.youtube.com/watch?v=zmt1RiFHMOA"
const BCH_ARGENTINA_CONFERENCE_READ_MORE_URL = "https://2024.bcharg.com/"

const LOCK_IN_2025_URL = "https://youtu.be/oPQ8w0yZ88E?t=247"
const LOCK_IN_2025_READ_MORE_URL = "https://bitcoincashresearch.org/t/chip-2021-05-targeted-virtual-machine-limits/437/26"

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

const HIJACKING_BITCOIN_READ_MORE_URL = "https://bitcoincashpodcast.com/faqs/Media/what-about-roger-vers-book-hijacking-bitcoin"
const HIJACKING_BITCOIN_GRAPHIC_URL = "https://bitcoincashpodcast.com/assets/images/hijacking-bitcoin-5542bf1c53b9af5dc7226cbb569cc105.png"

const {
  categories: {
    fork, softFork, hardFork, conference, projectLaunch, infrastructure, upcoming, historicEvent
  },
  upgrades
} = translations

export const CATEGORIES = {
  FORK: {
    FORK: translate(fork),
    HARD_FORK: translate(hardFork),
    SOFT_FORK: translate(softFork)
  },
  CONFERENCE: translate(conference),
  PROJECT_LAUNCH: translate(projectLaunch),
  INFRASTRUCTURE: translate(infrastructure),
  UPCOMING: translate(upcoming),
  HISTORIC_EVENT: translate(historicEvent)
}

const UPGRADES = [
  {
    title: "OP_CHECKSEQUENCEVERIFY",
    date: DateTime.fromISO("2016-07-04"),
    category: CATEGORIES.FORK.SOFT_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.opCheckSeqVerify.description),
    ],
    readMoreUrl: null
  },
  {
    title: "UAHF - BCH/BTC Split",
    date: DateTime.fromISO("2017-08-01"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.uahf.description),
      translate(upgrades.uahf.description2),
      translate(upgrades.uahf.description3),
    ],
    readMoreUrl: UAHF_READ_MORE_URL
  },
  {
    title: "CW-144",
    date: DateTime.fromISO("2017-11-13"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.cw144.description),
      translate(upgrades.cw144.description2),
    ],
    readMoreUrl: CW_144_READ_MORE_URL
  },
  {
    title: "Monolith",
    date: DateTime.fromISO("2018-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.monolith.description),
      translate(upgrades.monolith.description2),
      translate(upgrades.monolith.description3),
    ],
    readMoreUrl: MONOLITH_READ_MORE_URL
  },
  {
    title: "Magnetic Anomaly - BCH/BSV Split",
    date: DateTime.fromISO("2018-11-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.magneticAnomaly.description),
      translate(upgrades.magneticAnomaly.description2),
      translate(upgrades.magneticAnomaly.description3),
      translate(upgrades.magneticAnomaly.description4),
    ],
    readMoreUrl: MAGNETIC_ANOMALY_READ_MORE_URL
  },
  {
    title: "Great Wall",
    date: DateTime.fromISO("2019-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.greatWall.description),
      translate(upgrades.greatWall.description2),
      translate(upgrades.greatWall.description3),
    ],
    readMoreUrl: GREAT_WALL_READ_MORE_URL
  },
  {
    title: "Graviton",
    date: DateTime.fromISO("2019-11-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.graviton.description),
      translate(upgrades.graviton.description2),
      translate(upgrades.graviton.description3),
    ],
    readMoreUrl: GRAVITON_READ_MORE_URL
  },
  {
    title: "Phonon",
    date: DateTime.fromISO("2020-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.phonon.description),
      translate(upgrades.phonon.description2),
    ],
    readMoreUrl: PHONON_READ_MORE_URL
  },
  {
    title: "Axion - BCH/XEC Split",
    date: DateTime.fromISO("2020-11-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.axion.description),
      translate(upgrades.axion.description2),
      translate(upgrades.axion.description3),
    ],
    readMoreUrl: AXION_READ_MORE_URL
  },
  {
    title: "BigBlockIfTrue",
    date: DateTime.fromISO("2021-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.bigBlockIfTrue.description),
      translate(upgrades.bigBlockIfTrue.description2),
      translate(upgrades.bigBlockIfTrue.description3),
    ],
    readMoreUrl: BIGBLOCKIFTRUE_READ_MORE_URL
  },
  {
    title: "U8",
    date: DateTime.fromISO("2022-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.u8.description),
      translate(upgrades.u8.description2),
      translate(upgrades.u8.description3),
      translate(upgrades.u8.description4),
    ],
    readMoreUrl: U8_READ_MORE_URL
  },
  {
    title: "CashTokens",
    date: DateTime.fromISO("2023-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: CASHTOKENS_EXPLANER_VIDEO_URL,
    description: [
      translate(upgrades.cashtokens.description),
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
      translate(upgrades.abla.description),
      translate(upgrades.abla.description2),
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
  {
    title: "A Fifth Of Gaming",
    date: DateTime.fromISO("2023-09-22"),
    category: CATEGORIES.PROJECT_LAUNCH,
    videoUrl: null,
    graphicUrl: AFOG_GRAPHIC_URL,
    description: [
      "A Fifth Of Gaming, a service for running automated video game tournaments & social evenings with Bitcoin Cash, launches with its first public tournament.",
    ],
    readMoreUrl: null,
    appUrl: AFOG_APP_URL
  },
]

const UPCOMING = [
  {
    title: "BCH Argentina Conference",
    date: DateTime.fromISO("2024-10-12"),
    category: CATEGORIES.UPCOMING,
    videoUrl: BCH_ARGENTINA_CONFERENCE_VIDEO_URL,
    description: [
      "Upcoming conference in Buenos Aires, Argentina.",
      "Gathering for the sizeable local merchant community & opportunity for international guests to experience the thriving local BCH economy.",
      "Tickets on sale now!"
    ],
    readMoreUrl: BCH_ARGENTINA_CONFERENCE_READ_MORE_URL
  },
  {
    title: "Upgrade Lock in for 2025 Upgrade",
    date: DateTime.fromISO("2024-11-15"),
    category: CATEGORIES.UPCOMING,
    videoUrl: LOCK_IN_2025_URL,
    description: [
      "Deadline for community consensus on CHIP Upgrades suggested for May 2025.",
      "Proposals sufficiently supported are 'locked in' for implementation & go live on May 15 2025.",
      'Proposals with insufficient support remain in revision & discussion for the following year.',
      'The current proposals seriously under consideration are VM_Limits & accompanying work on BigInts.'
    ],
    readMoreUrl: LOCK_IN_2025_READ_MORE_URL
  }
]

const HISTORIC_EVENT = [
  {
    title: "Genesis Block",
    date: DateTime.fromISO("2009-01-03"),
    category: CATEGORIES.HISTORIC_EVENT,
    videoUrl: null,
    description: [
      "Satoshi Nakamoto starts the Bitcoin network by mining the very first block (Block 0).",
      "He includes a message embedded in the block: 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks', a reference to the days headline from British newspaper The Times.",
      'This message served the dual purpose of proving Satoshi had not begun work on the Genesis block earlier & establishing a statement as to the problems Bitcoin was created to solve.'
    ],
    readMoreUrl: GENESIS_READ_MORE_URL
  },
  {
    title: "Hijacking Bitcoin",
    date: DateTime.fromISO("2024-04-05"),
    category: CATEGORIES.HISTORIC_EVENT,
    videoUrl: null,
    graphicUrl: HIJACKING_BITCOIN_GRAPHIC_URL,
    description: [
      "Roger Ver & Steve Patterson release Hijacking Bitcoin - a well-cited exposé of the takeover of BTC & the origins of the BTC/BCH split.",
      "The book immediately makes a giant splash in the cryptocurrency industry as many people hear this essential information for the first time.",
    ],
    readMoreUrl: HIJACKING_BITCOIN_READ_MORE_URL
  }
]

// Default sort by reverse-chronological
const TIMELINE_ITEMS = [
  ...UPCOMING,
  ...CONFERENCES,
  ...UPGRADES,
  ...PROJECTS,
  ...INFRASTRUCTURE,
  ...HISTORIC_EVENT
].sort((a, b) => b.date - a.date)

export default TIMELINE_ITEMS