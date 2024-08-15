import { ApolloProvider } from "@apollo/client";
import AppSubSectionWrapper from "@/apps/AppSubSectionWrapper/AppSubSectionWrapper";
import ExploreStatBlock from "./ExploreStatBlock";
import GlobalAdoptionSummary from "./GlobalAdoptionSummary";
import EmbeddedIFrame from "@/components/atoms/EmbeddedIFrame/EmbeddedIFrame";
import apolloClient from "@/apolloClient";

const AFITH_OF_GAMING_STATS_URL = "https://afifthofgaming.com/stats";
const BCH_GURU_STATS_URL = "https://nfts.bch.guru/science";
const TOKENAUT_URL = "https://tokenaut.cash/";
const DEFI_LLAMA_URL = "https://defillama.com/chain/Bitcoincash";
const TX_CITY_URL = "https://txcity.io/v/bch";
const TX_WATCH_URL = "https://buyhodlsell.com/tx-watch";

const SUBSECTIONS = [
  {
    name: "Selene",
    children: (
      <div className="pb-28">
        <div className="p-2">
          <ApolloProvider client={apolloClient}>
            <ExploreStatBlock />
            <GlobalAdoptionSummary />
          </ApolloProvider>
        </div>
      </div>
    ),
  },
  {
    name: "A Fifth Of Gaming",
    children: <EmbeddedIFrame src={AFITH_OF_GAMING_STATS_URL} />,
  },
  {
    name: "BCH Guru",
    children: <EmbeddedIFrame src={BCH_GURU_STATS_URL} />,
  },
  {
    name: "Tokenaut",
    children: <EmbeddedIFrame src={TOKENAUT_URL} />,
  },
  {
    name: "DeFi Llama",
    children: <EmbeddedIFrame src={DEFI_LLAMA_URL} />,
  },
  {
    name: "Tx City",
    children: <EmbeddedIFrame src={TX_CITY_URL} />,
  },
  {
    name: "Tx Watch",
    children: <EmbeddedIFrame src={TX_WATCH_URL} />,
  },
];

export default function ExploreStatsView() {
  return <AppSubSectionWrapper subsections={SUBSECTIONS} />;
}
