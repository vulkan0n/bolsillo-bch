import AppSubSectionWrapper from "@/components/atoms/AppSubSectionWrapper/AppSubSectionWrapper";
import EmbeddedIFrame from "@/components/atoms/EmbeddedIFrame/EmbeddedIFrame";

const BCH_PODCAST_FAQ_URL = "https://bitcoincashpodcast.com/faqs";
const DISCOVER_CASH_URL = "https://discover.cash/"
const BCHF_URL = "https://bitcoincashfoundation.org/";
const HELPME_CASH_URL = "https://helpme.cash/";

const SUBSECTIONS = [
  {
    name: "The Bitcoin Cash Podcast",
    children: <EmbeddedIFrame src={BCH_PODCAST_FAQ_URL} />
  },
  {
    name: "Discover.cash",
    children: <EmbeddedIFrame src={DISCOVER_CASH_URL} />
  },
  {
    name: "Bitcoin Cash Foundation",
    children: <EmbeddedIFrame src={BCHF_URL} />
  },
  {
    name: "HelpMe.Cash",
    children: <EmbeddedIFrame src={HELPME_CASH_URL} />
  }
]

export default function ExploreFAQsView() {
  return (
    <AppSubSectionWrapper subsections={SUBSECTIONS} />
  );
}
