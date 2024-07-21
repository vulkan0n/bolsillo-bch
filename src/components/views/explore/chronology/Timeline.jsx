import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import EmbeddedVideo from '../../../atoms/EmbeddedVideo/EmbeddedVideo';
import { CATEGORIES } from './timelineItems';

export default function Timeline({ timelineItems }) {
  const isTimelineItemsEmpty = timelineItems.length === 0

  if (isTimelineItemsEmpty) {
    return (
      <div>No items found</div>
    )
  }

  return (
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
          <div className="pb-2" >
            {category === (CATEGORIES.FORK.HARD_FORK || CATEGORIES.FORK.SOFT_FORK) && <span className={"text text-zinc-200 pb-2"}>{CATEGORIES.FORK.FORK} - </span>}
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