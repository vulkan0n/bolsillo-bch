import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube'
import { translate } from "@/util/translations";
import AppHero from '@/components/atoms/AppHero/AppHero';
import { LikeOutlined, YoutubeOutlined } from '@ant-design/icons';
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

const RECOMMENDED_YOUTUBE_CHANNELS = [
  {
    name: "The Bitcoin Cash Podcast",
    url: "https://www.youtube.com/channel/UCsrDsJnHFnkMnJhEslofyPQ"
  },
  {
    name: "General Protocols Spaces",
    url: "https://www.youtube.com/@generalprotocols",
  },
  {
    name: "Bitcoin Cash Foundation",
    url: "https://www.youtube.com/@BitcoinCashFoundation"
  },
  {
    name: "Ray Uses Bitcoin Cash",
    url: "https://www.youtube.com/@rayusesbitcoincash"
  },
  {
    name: "Ryan Giffin",
    url: "https://www.youtube.com/@RyanGiffin"
  },
  {
    name: "Mr Zwets",
    url: "https://www.youtube.com/@mrzwets"
  },
  {
    name: "Dunconomics",
    url: "https://www.youtube.com/@dunconomics"
  },
  {
    name: "Bitcoin Jason",
    url: "https://www.youtube.com/@BitcoinJason"
  },
  {
    name: "Paul",
    url: "https://www.youtube.com/@rspl2024"
  },
  {
    name: "Cryptocurrency Theory",
    url: "https://www.youtube.com/@CryptocurrencyTheory"
  }
]

export default function ExploreSocialMediaView() {
  return (
    <div>
      <AppHero
        title="Social Media"
        description="Get involved in the latest content, news & discussion in BCH."
        icon={<LikeOutlined className="text-xl my-auto text-zinc-200" />}
      />

      <div className="px-3">
        <div className="w-full  text-center justify-center align-center bg-red-200">
          <h1>Youtube</h1>
          <YoutubeOutlined className="text-xl my-auto text-zinc-800" />

          <div className="text-left">
            <p>Recommended channels:</p>
            <ul>
              {RECOMMENDED_YOUTUBE_CHANNELS.map(channel => <li>
                <a href={channel.url} target="_blank">- <u>{channel.name}</u></a>
              </li>)}
            </ul>
          </div>

        </div>
      </div>

    </div >
  );
}
