import TIMELINE_ITEMS, { CATEGORIES } from './timelineItems';

export default function FilterPanel({
  isDisplayHardForks,
  isDisplaySoftForks,
  isDisplayConferences,
  setIsDisplayHardForks,
  setIsDisplaySoftForks,
  setIsDisplayConferences,
}) {
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

  const hardForksCount = TIMELINE_ITEMS.filter(item => item.category === CATEGORIES.FORK.HARD_FORK).length
  const softForksCount = TIMELINE_ITEMS.filter(item => item.category === CATEGORIES.FORK.SOFT_FORK).length
  const conferencesCount = TIMELINE_ITEMS.filter(item => item.category === CATEGORIES.CONFERENCE).length

  return (
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
  );
}
