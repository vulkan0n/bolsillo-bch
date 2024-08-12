import { useState, useEffect } from 'react';
import AppHero from '@/components/atoms/AppHero/AppHero';
import { LikeOutlined, YoutubeOutlined } from '@ant-design/icons';
import { RECOMMENDED_YOUTUBE_CHANNELS } from './recommended';
import { TabSwitcher } from './TabSwitcher';
import { YOUTUBE_FEED } from './youtubeFeed';
import EmbeddedVideo from '@/components/atoms/EmbeddedVideo/EmbeddedVideo';
import AppSubSectionWrapper from "@/components/atoms/AppSubSectionWrapper/AppSubSectionWrapper";

export const OPTIONS = {
  YOUTUBE: "Youtube",
  TWITTER: "Twitter"
}

const SUBSECTIONS = [
  {
    name: "Latest Feed",
    children: null
  },
  {
    name: "HelpMe.Cash",
    children: <div><h1>HelpMe.Cash</h1></div>
  },
  {
    name: "Discover.cash",
    children: <div><h1>Discover.cash</h1></div>
  },
]


export default function ExploreSocialMediaView() {
  const [selected, setSelected] = useState(OPTIONS.YOUTUBE)

  return (
    <div>
      <div className="flex flex-col mb-16">
        <AppHero
          title="Social Media"
          description="Get involved in the latest content, news & discussion in BCH."
          icon={<LikeOutlined className="text-xl my-auto text-zinc-200" />}
          expandableTitle={"Recommended channels"}
        />

        <AppSubSectionWrapper subsections={SUBSECTIONS} />

        {YOUTUBE_FEED.map(video => {
          return (
            <div key={video.videoTitle} className="block p-4 mb-1 mx-2 bg-white border border-gray-800 border-2 rounded-lg shadow">
              <h5 className="mb-2 text-xl font-bold text-zinc-700">{video.videoTitle}</h5>
              <p className="font-normal text-gray-700 dark:text-gray-400 pb-2">{video.channelName} - {video.videoDate}</p>
              <EmbeddedVideo url={video.videoUrl} />
            </div>
          )
        })}
      </div>
    </div >
  );
}
