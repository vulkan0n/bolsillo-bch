const translations = {
  chronology: {
    en: "Chronology",
  },
  description: {
    en: "Explore the history of BCH upgrades, apps, conferences & historical events.",
  },
  noItems: {
    en: "No items found. Adjust filters to populate."
  },
  readMore: {
    en: "Read More"
  },
  tryItInSelene: {
    en: "Try it in Selene"
  },
  categories: {
    fork: {
      en: "Protocol Upgrade"
    },
    hardFork: {
      en: "Hard Fork"
    },
    softFork: {
      en: "Soft Fork"
    },
    conference: {
      en: "Conference"
    },
    projectLaunch: {
      en: "Project Launch"
    },
    infrastructure: {
      en: "Developer Tools & Infrastructure"
    },
    upcoming: {
      en: "Upcoming (Planned / Theoretical)"
    },
    historicEvent: {
      en: "Historic Event"
    }
  },
  upgrades: {
    opCheckSeqVerify: {
      description: {
        en: "Addition of OP_CHECKSEQUENCEVERIFY."
      }
    },
    uahf: {
      description: {
        en: "Mired in the chaos of The Blocksize War, big blockers take a stand & split the original Bitcoin into separate BTC & BCH chains."
      },
      description2: {
        en: "UAHF stands for User Activated Hard Fork."
      },
      description3: {
        en: "The initial upgrade raised the blocksize from 1MB to 8MB & pre-empted the incoming (unwanted) SegWit changes later added with a UASF (Soft Fork) to the BTC side."
      }
    },
    cw144: {
      description: {
        en: "The BCH Difficulty Adjustment Algorithm updated to cw-144 to help it better handle the rapid price & hashrate fluctuations resulting from sharing SHA256 miners with the BTC chain."
      },
      description2: {
        en: "Although initially resource intensive to research & implement, this greatly increased BCH resilience in comparison to BTC."
      }
    },
    monolith: {
      description: {
        en: "BCH begins a cadence of 6-monthly upgrades. Two changes are implemented, increased blocksize & extra op-codes."
      },
      description2: {
        en: "32 MB blocks: Network capacity raised 4x after sufficient research & testing done to ensure network resilience."
      },
      description3: {
        en: "OP_Codes: Several OP_codes (including OP_CAT, OP_DIV) deactivated in 2010 & 2011 are reactivated on BCH after re-examination & redesigning as necessary to restore Bitcoin script functionality."
      }
    },
    magneticAnomaly: {
      description: {
        en: "BCH continues its cadence of 6-monthly upgrades. Two changes are implemented, CTOR & new OP_Codes."
      },
      description2: {
        en: "In protest of these changes, the 'Bitcoin Satoshi's Vision' (BSV) community split the chain to follow their own direction after a dramatic 'Hash War' in which they fail to secure control of the BCH chain."
      },
      description3: {
        en: "CTOR (Canonical Transaction Ordering): Transaction ordering within a block must conform to an exact sorting by numerically ascending transaction ids. This improves scaling by reducing need to transmit ordering information & improve transaction parallel processing."
      },
      description4: {
        en: "OP_CHECKDATASIG & OP_CHECKDATASIGVERIFY: New OP_Codes introduced allowing verification of non-blockchain data, for example oracle messages."
      }
    },
    greatWall: {
      description: {
        en: "BCH continues its cadence of 6-monthly upgrades. Schnorr signatures added & SegWit coins recovery enabled."
      },
      description2: {
        en: "Schnorr signatures: A new cryptographic signature scheme is added for some OP_Codes to resolve 3rd party malleability among other reasons."
      },
      description3: {
        en: "SegWit Recovery: Correction of an oversight in the previous upgrade that made SegWit coins unspendable."
      }
    },
    graviton: {
      description: {
        en: "BCH continues its cadence of 6-monthly upgrades."
      },
      description2: {
        en: "Schnorr signatures expanded to cover some multisig transactions."
      },
      description3: {
        en: "Malleability mitigations that were previously mempool-enforced are moved to the consensus layer."
      }
    },
    phonon: {
      description: {
        en: "BCH continues its cadence of 6-monthly upgrades."
      },
      description2: {
        en: "OP_REVERSEBYTES added & SigChecks system introduced to better match transaction needs with computing resources consumed."
      }
    },
    axion: {
      description: {
        en: "BCH continues its cadence of 6-monthly upgrades."
      },
      description2: {
        en: "After significant community turmoil, prominent developer Amaury Sechet & his BCHABC node team split off into their own coin 'eCash' (XEC)."
      },
      description3: {
        en: "ASERT: The 2017 BCH DAA (CW-144) was encouraging miners to switch frenetically between Bitcoin chains & disrupting BCH confirmation times."
      }
    },
    bigBlockIfTrue: {
      description: {
        en: "BCH continues its cadence of 6-monthly upgrades."
      },
      description2: {
        en: "Unconfirmed Transaction Limit Removed: Unconfirmed transaction chains were previously limited to 50 transactions per block. This limit was removed, allowing unlimited length chains. This removed a lot of developer friction for programmers of real-time apps that may chain transactions at high speeds."
      },
      description3: {
        en: "Multiple OP_RETURNs: Additional on-chain data flexibility was introduced by removing a restriction of only one OP_RETURN per transaction."
      }
    },
    u8: {
      description: {
        en: "BCH continues its cadence of 6-monthly upgrades."
      },
      description2: {
        en: "Introspection: Covenents were enabled by Magnetic Anomaly in November 2018, but efficiency & ease of use was very low. Introspection OP_Codes added to significantly improve the developer experience & power of BCH smart contract programming."
      },
      description3: {
        en: "64 Bit Integers: 32 bit integers were restricting the ease & potential of mathematical operations in smart contracts. The range of usable numbers expanded enormously to 64 bits."
      },
      description4: {
        en: "OP_MUL: Mathematics OP_Code re-enabled in parallel with 64 bit integers."
      }
    },
    cashtokens: {
      description: {
        en: "Protocol native CashTokens added to BCH, allowing for smart-contracts, fungible tokens & non-fungible tokens directly validated by the network."
      }
    },
    abla: {
      description: {
        en: "BCH's 32 MB blocksize limit replaced with a new adjustable limit that scales with and responds intelligently to live network traffic."
      },
      description2: {
        en: "Upgrade was celebrated at BCH BLISS in Ljubljana, Slovenia."
      }
    }
  },
  conferences: {
    bchCity: {
      description: {
        en: "Conference held in the 'Bitcoin Cash City' Townsvile, Australia 4th - 5th September 2019."
      },
      description2: {
        en: "Only 2 years after the split from BTC, the BCH community converged to assess the state of the revolution."
      }
    },
    bch22: {
      description: {
        en: "Conference held in St Kitts 12th - 13th November 2023."
      },
      description2: {
        en: "Arranged to experience the impressive BCH adoption on the island & discuss the future of BCH."
      }
    },
    bliss: {
      description: {
        en: "Conference held in Ljubljana, Slovenia 14th - 15th May 2024."
      },
      description2: {
        en: "Arranged to celebrate the ABLA upgrade, discuss industry thinking & for community networking."
      }
    }
  },
  infra: {
    cashscript: {
      description: {
        en: "Higher-level language compiler for programmers building Bitcoin Cash smart contracts."
      }
    }
  },
  projects: {
    flipstarter: {
      description: {
        en: "Non-custodial, open-source, on-chain crowdfunding allowing BCH projects to bootstrap from community funding."
      }
    },
    jogs: {
      description: {
        en: "Peer-reviewed medical journal with a unique publishing model."
      },
      description2: {
        en: "Journal articles are accessed by BCH micropayments & articles become public once cost of research is recouped."
      }
    },
    bitcoinCashPodcast: {
      description: {
        en: "The Bitcoin Cash Podcast publishes its first piece of BCH content with the release of Episode 1."
      }
    },
    aFifthOfGaming: {
      description: {
        en: "A Fifth Of Gaming, a service for running automated video game tournaments & social evenings with Bitcoin Cash, launches with its first public tournament."
      }
    }
  },
  upcomingEvents: {
    bchArgentinaConference: {
      description: {
        en: "Upcoming conference in Buenos Aires, Argentina."
      },
      description2: {
        en: "Gathering for the sizeable local merchant community & opportunity for international guests to experience the thriving local BCH economy."
      },
      description3: {
        en: "Tickets on sale now!"
      }
    },
    lockIn2025: {
      description: {
        en: "Deadline for community consensus on CHIP Upgrades suggested for May 2025."
      },
      description2: {
        en: "Proposals sufficiently supported are 'locked in' for implementation & go live on May 15 2025."
      },
      description3: {
        en: "Proposals with insufficient support remain in revision & discussion for the following year."
      },
      description4: {
        en: "The current proposals seriously under consideration are VM_Limits & accompanying work on BigInts."
      }
    }
  },
  historicEvents: {
    genesisBlock: {
      description: {
        en: "Satoshi Nakamoto starts the Bitcoin network by mining the very first block (Block 0)."
      },
      description2: {
        en: "He includes a message embedded in the block: 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks', a reference to the days headline from British newspaper The Times."
      },
      description3: {
        en: 'This message served the dual purpose of proving Satoshi had not begun work on the Genesis block earlier & establishing a statement as to the problems Bitcoin was created to solve.'
      }
    },
    hijackingBitcoin: {
      description: {
        en: "Roger Ver & Steve Patterson release Hijacking Bitcoin - a well-cited exposé of the takeover of BTC & the origins of the BTC/BCH split."
      },
      description2: {
        en: "The book immediately makes a giant splash in the cryptocurrency industry as many people hear this essential information for the first time."
      }
    }
  }
};

export default translations;
