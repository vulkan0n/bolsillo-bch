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
    }
  }

};

export default translations;
