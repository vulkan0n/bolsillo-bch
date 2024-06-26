import { useState } from 'react'

export const TabSwitcher = () => {
  const OPTIONS = {
    YOUTUBE: "Youtube",
    TWITTER: "Twitter"
  }

  const [selected, setSelected] = useState(OPTIONS.YOUTUBE)

  return (
    <div className="flex mx-2 mt-2 rounded-md bg-blue-gray-100">
      <div
        className={`flex-1 py-1 my-2 ml-2 text-center rounded-md bg-${selected === OPTIONS.YOUTUBE ? 'red-300' : 'zinc-200'}`}
      >
        <button
          className={'w-full text-sm cursor-pointer select-none focus:outline-none font-bold text-blue-gray-900'}
          onClick={() => {
            setSelected(OPTIONS.YOUTUBE)
          }}
        >
          {OPTIONS.YOUTUBE}
        </button>
      </div>
      <div
        className={`flex-1 py-1 my-2 ml-2 text-center rounded-md bg-${selected === OPTIONS.TWITTER ? 'red-300' : 'zinc-200'}`}
      >
        <button
          className={
            'w-full text-sm cursor-pointer select-none focus:outline-none font-bold text-blue-gray-900'}
          onClick={() => {
            setSelected(OPTIONS.TWITTER)
          }}
        >
          {OPTIONS.TWITTER}
        </button>
      </div>
      <div
        className={'flex-1 py-1 my-2 mr-2 text-center rounded-md bg-white'}
      >
        <button
          className={
            'w-full text-sm cursor-pointer select-none focus:outline-none font-bold text-blue-gray-900'}
          onClick={() => {
            setSelected('system')
          }}
        >
          ~~Third one
        </button>
      </div>
    </div >
  )
}
