import AppSubSectionWrapper from "@/components/atoms/AppSubSectionWrapper/AppSubSectionWrapper";
import EmbeddedIFrame from "@/components/atoms/EmbeddedIFrame/EmbeddedIFrame";

const BCH_PODCAST_FAQ_URLS = "https://bitcoincashpodcast.com/faqs";
const BCH_GURU_STATS_URL = "https://nfts.bch.guru/science";
const TOKENAUT_URL = "https://tokenaut.cash/";
const DEFI_LLAMA_URL = "https://defillama.com/chain/Bitcoincash"

const SUBSECTIONS = [
  {
    name: "The Bitcoin Cash Podcast",
    children: <EmbeddedIFrame src={BCH_PODCAST_FAQ_URLS} />
  },
  {
    name: "BCH Guru",
    children: <EmbeddedIFrame src={BCH_GURU_STATS_URL} />
  },
  {
    name: "Tokenaut",
    children: <EmbeddedIFrame src={TOKENAUT_URL} />
  },
  {
    name: "DeFi Llama",
    children: <EmbeddedIFrame src={DEFI_LLAMA_URL} />
  }
]

export default function ExploreFAQsView() {
  return (
    <AppSubSectionWrapper subsections={SUBSECTIONS} />
  );
}
