import { useState } from 'react';
import 'react-vertical-timeline-component/style.min.css';
import {
  ProfileOutlined,
} from "@ant-design/icons";
import AppHero from '@/components/atoms/AppHero/AppHero';
import TIMELINE_ITEMS, { CATEGORIES } from './timelineItems';
import FilterPanel from './FilterPanel';
import Timeline from './Timeline';

export default function ExploreChronologyView() {
  const [isReverseTimeline, setIsReverseTimeline] = useState(false)
  const [isDisplayHardForks, setIsDisplayHardForks] = useState(true)
  const [isDisplaySoftForks, setIsDisplaySoftForks] = useState(true)
  const [isDisplayConferences, setIsDisplayConferences] = useState(true)
  const [isDisplayProjectLaunches, setIsDisplayProjectLaunches] = useState(true)

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

    if (item.category === CATEGORIES.PROJECT_LAUNCH && !isDisplayProjectLaunches) {
      return false
    }

    return true
  })

  return (
    <div>
      <AppHero
        title="Chronology"
        description="Explore the history of BCH upgrades, apps, conferences & historical events."
        icon={<ProfileOutlined className="text-xl my-auto text-zinc-200" />}
      />

      <hr />

      {/* <button
        className="flex justify-center m-1 rounded-full border border-2 border-primary bg-primary text-zinc-100 shadow-md opacity-90"
        onClick={() => setIsReverseTimeline(!isReverseTimeline)}
      >
        Reverse
      </button>

      <div>{isReverseTimeline.toString()}</div> */}

      <FilterPanel
        isDisplayHardForks={isDisplayHardForks}
        isDisplaySoftForks={isDisplaySoftForks}
        isDisplayConferences={isDisplayConferences}
        isDisplayProjectLaunches={isDisplayProjectLaunches}
        setIsDisplayHardForks={setIsDisplayHardForks}
        setIsDisplaySoftForks={setIsDisplaySoftForks}
        setIsDisplayConferences={setIsDisplayConferences}
        setIsDisplayProjectLaunches={setIsDisplayProjectLaunches}
      />

      <hr />

      <Timeline timelineItems={timelineItems} />
    </div >
  );
}
