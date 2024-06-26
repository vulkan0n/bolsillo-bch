import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube'
import { translate } from "@/util/translations";
import AppHero from '@/components/atoms/AppHero/AppHero';
import { LikeOutlined, YoutubeOutlined } from '@ant-design/icons';
import { RECOMMENDED_YOUTUBE_CHANNELS } from './recommended';
import { TabSwitcher } from './TabSwitcher';
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
              {RECOMMENDED_YOUTUBE_CHANNELS.map(channel => <li key={channel.name}>
                <a href={channel.url} target="_blank">- <u>{channel.name}</u></a>
              </li>)}
            </ul>
          </div>

        </div>

        <TabSwitcher />
      </div>

    </div >
  );
}
