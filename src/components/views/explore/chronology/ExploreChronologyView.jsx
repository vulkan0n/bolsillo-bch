import { useState } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import {
  ProfileOutlined,
} from "@ant-design/icons";
import AppHero from '@/components/atoms/AppHero/AppHero';
import EmbeddedVideo from '../../../atoms/EmbeddedVideo/EmbeddedVideo';
import TIMELINE_ITEMS, { CATEGORIES } from './timelineItems';

export default function ExploreChronologyView() {
  const [isReverseTimeline, setIsReverseTimeline] = useState(false)
  const [isDisplayHardForks, setIsDisplayHardForks] = useState(true)
  const [isDisplaySoftForks, setIsDisplaySoftForks] = useState(true)
  const [isDisplayConferences, setIsDisplayConferences] = useState(true)

  const timelineItems = TIMELINE_ITEMS.reverse().filter(item => {
    if (item.category === CATEGORIES.FORK.HARD_FORK && !isDisplayHardForks) {
      return false
    }

    if (item.category === CATEGORIES.FORK.SOFT_FORK && !isDisplaySoftForks) {
      return false
    }

    if (item.category === CATEGORIES.CONFERENCE && !isDisplayConferences) {
      return false
    }

    return true
  })

  const forksCount = TIMELINE_ITEMS.filter(item => Object.keys(CATEGORIES.FORK).includes(item.category)).length
  const hardForksCount = TIMELINE_ITEMS.filter(item => item.category === CATEGORIES.FORK.HARD_FORK).length
  const softForksCount = TIMELINE_ITEMS.filter(item => item.category === CATEGORIES.FORK.SOFT_FORK).length
  const conferencesCount = TIMELINE_ITEMS.filter(item => item.category === CATEGORIES.CONFERENCE).length

  console.log({ timelineItems })

  const isTimelineItemsEmpty = timelineItems.length === 0

  return (
    <div>
      <AppHero
        title="Chronology"
        description="Explore the history of BCH upgrades, apps, conferences & historical events."
        icon={<ProfileOutlined className="text-xl my-auto text-zinc-200" />}
      />

      <hr />

      <button
        className="flex justify-center m-1 rounded-full border border-2 border-primary bg-primary text-zinc-100 shadow-md opacity-90"
        onClick={() => setIsReverseTimeline(!isReverseTimeline)}
      >
        Reverse
      </button>

      <div>{isReverseTimeline.toString()}</div>

      <div className="px-6 pb-1">
        <span className="text-lg font-bold">Categories</span>
        <div>
          <input
            type="checkbox"
            checked={isDisplayHardForks}
            onChange={(event) => {
              const { checked: isChecked } = event.target;
              setIsDisplayHardForks(isChecked);
            }}
          />
          <span>{hardForksCount}x {CATEGORIES.FORK.FORK} ({CATEGORIES.FORK.HARD_FORK})</span>
        </div>

        <div>
          <input
            type="checkbox"
            checked={isDisplaySoftForks}
            onChange={(event) => {
              const { checked: isChecked } = event.target;
              setIsDisplaySoftForks(isChecked);
            }}
          />
          <span>{softForksCount}x {CATEGORIES.FORK.FORK} ({CATEGORIES.FORK.SOFT_FORK})</span>
        </div>

        <input
          type="checkbox"
          checked={isDisplayConferences}
          onChange={(event) => {
            const { checked: isChecked } = event.target;
            setIsDisplayConferences(isChecked);
          }}
        />
        <span>{conferencesCount}x {CATEGORIES.CONFERENCE}</span>
      </div>

      <hr />

      {
        isTimelineItemsEmpty && (
          <div>No items found</div>
        )
      }

      {
        !isTimelineItemsEmpty && (
          <VerticalTimeline
            lineColor={'black'}
            layout={'1-column-left'}
          >
            {timelineItems.map(({ title, date, subtitle, category, videoUrl, description, readMoreUrl }) => (
              <VerticalTimelineElement
                contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff', paddingTop: 0, paddingBottom: 0 }}
                contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
                iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                icon={null}
              >
                <div className="pb-1" >
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xl font-bold">{title}</span>
                    <span className={"text text-zinc-200 pt-0 mt-2"}>{date}</span>
                  </div>
                  {subtitle && <span className="text-md text-white-800 pt-6">{subtitle}</span>}
                </div>
                <div className="flex justify-between" >
                  <span className={"text text-zinc-200 pb-2"}>{category}</span>
                </div>

                {videoUrl && <EmbeddedVideo url={videoUrl} />}

                {description && description.map(text => <div className={"py-1"}>
                  <span className={"text italic"}>{text}</span>
                </div>)}

                {readMoreUrl && <div>
                  <a
                    href={readMoreUrl}
                    target="_blank"
                    className="flex justify-center m-1 rounded-full border border-2 border-primary bg-primary text-zinc-100 shadow-md opacity-90"
                  >
                    Read More
                  </a>
                </div>}
              </VerticalTimelineElement>
            ))}
          </VerticalTimeline>
        )
      }
    </div >
  );
}
