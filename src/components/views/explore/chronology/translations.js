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
  }

};

export default translations;
