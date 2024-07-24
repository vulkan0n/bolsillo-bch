import TIMELINE_ITEMS, { CATEGORIES } from './timelineItems';

export default function FilterPanel({
  isDisplayHardForks,
  isDisplaySoftForks,
  isDisplayConferences,
  isDisplayProjectLaunches,
  setIsDisplayHardForks,
  setIsDisplaySoftForks,
  setIsDisplayConferences,
  setIsDisplayProjectLaunches,
}) {

  const hardForksCount = TIMELINE_ITEMS.filter(item => item.category === CATEGORIES.FORK.HARD_FORK).length
  const softForksCount = TIMELINE_ITEMS.filter(item => item.category === CATEGORIES.FORK.SOFT_FORK).length
  const conferencesCount = TIMELINE_ITEMS.filter(item => item.category === CATEGORIES.CONFERENCE).length
  const projectLaunchesCount = TIMELINE_ITEMS.filter(item => item.category === CATEGORIES.PROJECT_LAUNCH).length

  return (
    <div className="px-6 pb-1">
      <span className="text-lg font-bold">Categories</span>

      <div>
        <input
          type="checkbox"
          className="mr-1"
          checked={isDisplayHardForks}
          onChange={(event) => {
            const { checked: isChecked } = event.target;
            setIsDisplayHardForks(isChecked);
          }}
        />
        <span className="text-blue-500">&#9632;</span>
        <span>
          {hardForksCount}x{' '}
          {CATEGORIES.FORK.FORK} ({CATEGORIES.FORK.HARD_FORK})
        </span>
      </div>

      <div>
        <input
          type="checkbox"
          className="mr-1"
          checked={isDisplaySoftForks}
          onChange={(event) => {
            const { checked: isChecked } = event.target;
            setIsDisplaySoftForks(isChecked);
          }}
        />
        <span className="text-blue-500">&#9632;</span>
        <span>{softForksCount}x {' '}
          {CATEGORIES.FORK.FORK} ({CATEGORIES.FORK.SOFT_FORK})
        </span>
      </div>

      <div>
        <input
          type="checkbox"
          className="mr-1"
          checked={isDisplayConferences}
          onChange={(event) => {
            const { checked: isChecked } = event.target;
            setIsDisplayConferences(isChecked);
          }}
        />
        <span className="text-blue-500">&#9632;</span>
        <span>{conferencesCount}x {CATEGORIES.CONFERENCE}</span>
      </div>

      <div>
        <input
          type="checkbox"
          className="mr-1"
          checked={isDisplayProjectLaunches}
          onChange={(event) => {
            const { checked: isChecked } = event.target;
            setIsDisplayProjectLaunches(isChecked);
          }}
        />
        <span className="text-blue-500">&#9632;</span>
        <span>{projectLaunchesCount}x {CATEGORIES.PROJECT_LAUNCH}</span>
      </div>
    </div >
  );
}
