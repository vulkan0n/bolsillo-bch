import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube'
import { translate } from "@/util/translations";
import AppHero from '@/components/atoms/AppHero/AppHero';
// import translations from "./ExploreAfogViewTranslations";

// const {
//   upcomingTournaments,
//   startsIn,
//   underway,
//   prizePool,
//   playersText,
//   description,
//   signUp,
//   learnMore,
//   loadingText
// } = translations;

export default function ExploreSocialMediaView() {
  return (
    <div>
      <AppHero
        description="Get involved in the latest content, news & discussion in BCH."
      />
    </div >
  );
}
