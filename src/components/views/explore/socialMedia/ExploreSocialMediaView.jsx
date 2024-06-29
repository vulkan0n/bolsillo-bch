import { useState, useEffect } from 'react';
import AppHero from '@/components/atoms/AppHero/AppHero';
import { LikeOutlined, YoutubeOutlined } from '@ant-design/icons';
import { RECOMMENDED_YOUTUBE_CHANNELS } from './recommended';
import { TabSwitcher } from './TabSwitcher';

export const OPTIONS = {
  YOUTUBE: "Youtube",
  TWITTER: "Twitter"
}

export default function ExploreSocialMediaView() {
  const [selected, setSelected] = useState(OPTIONS.YOUTUBE)

  return (
    <div>
      <div className="flex flex-col mb-16 bg-pink-200">
        <AppHero
          title="Social Media"
          description="Get involved in the latest content, news & discussion in BCH."
          icon={<LikeOutlined className="text-xl my-auto text-zinc-200" />}
        />

        <div className="px-3 bg-green-200">
          <div className="w-full  text-center justify-center items-center">
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
        </div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <p>something</p>
      </div>

      {/* <div className="bg-green-600"> */}
      <div className="fixed bottom-16 w-full bg-green-600">
        <TabSwitcher selected={selected} setSelected={setSelected} />
      </div>
    </div >
  );
}
