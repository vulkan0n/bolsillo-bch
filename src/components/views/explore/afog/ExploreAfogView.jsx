import { useState, useEffect } from 'react';
import { DateTime } from "luxon";
import ReactPlayer from 'react-player/youtube'
import { UpSquareOutlined, DownSquareOutlined, LaptopOutlined } from "@ant-design/icons";
import { translate } from "@/util/translations";
import translations from "./ExploreAfogViewTranslations";

const {
  upcomingTournaments,
  startsIn,
  underway,
  prizePool,
  playersText,
  description,
  signUp,
  learnMore,
  loadingText
} = translations;

export default function ExploreAfogView() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false)

  const AFOG_BASE_URL = "https://afifthofgaming.com"
  const AFOG_ENDPOINT = `${AFOG_BASE_URL}/Session/GetTournaments`

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(AFOG_ENDPOINT);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const tournamentData = data?.data
        const sortedData = tournamentData.sort((a, b) => {
          const dateA = DateTime.fromISO(a.date)
          const dateB = DateTime.fromISO(b.date)
          const res = dateA > dateB
          return res ? 1 : -1
        })
        setTournaments(sortedData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const Table = () => {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div>
            <h1 className="text-base font-semibold leading-6 text-gray-900">{translate(upcomingTournaments)}</h1>
          </div>
        </div>
        <div className="mt-1 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <tbody className="divide-y divide-gray-200">
                  {tournaments && tournaments.map(({ id, game, prize, players, date, timeUntilStartDisplay, ...data }) => {
                    const title = data.cycle.game.title
                    const guild = data.cycle.guild.name
                    const formattedDatePart1 = DateTime.fromISO(date).toFormat('ccc dd LLL yyyy')
                    const formattedDatePart2 = DateTime.fromISO(date).toFormat('HH:mm ZZZZ')
                    const imageUrl = data.cycle.game.igdbImageUrl

                    return (
                      <tr key={id} className="flex justify-left">
                        <td className="px-2 min-w-2 my-auto">
                          <img src={imageUrl} alt="Game image" width="100" height="100" />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <b>{title}</b>
                          <br />
                          (<i>{guild}</i>)
                          <br />
                          <br />
                          {formattedDatePart1}
                          <br />
                          {formattedDatePart2}
                          <br />
                          {timeUntilStartDisplay && <span>{translate(startsIn)}{" "}{timeUntilStartDisplay}</span>}
                          {!timeUntilStartDisplay && <span>{translate(underway)}</span>}
                          <br />
                          <br />
                          {translate(prizePool)}: ${data?.walletValue.toFixed(2)} ({data?.walletBalance} sats)
                          <br />
                          {translate(playersText)}: {data?.attendance?.length}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div >
    )
  }

  const EmbeddedVideo = ({ url }) => (
    <div className="w-full flex justify-center">
      <ReactPlayer
        url={url}
        width={"100%"}
      />
    </div>
  )

  return (
    <div>
      <div className="shadow rounded-lg m-2 p-2 bg-zinc-900 flex-column justify-center items-center">
        <div className="w-full">
          <div className="flex justify-center align-center">
            <span className="flex justify-center align-center">
              <LaptopOutlined className="text-xl my-auto pr-1 text-zinc-200" />
            </span>
            <span className="font-bold text-xl text-center text-zinc-300 px-1">
              A Fifth Of Gaming
            </span>
            <span className="flex justify-center align-center">
              <LaptopOutlined className="text-xl my-auto pl-1 text-zinc-200" />
            </span>

          </div>

          <div className="text-md text-center text-zinc-300">
            {translate(description)}
          </div>
        </div>

        <div><a
          href="https://afifthofgaming.com/"
          target="_blank"
          className="flex justify-center p-2 m-4 rounded-full border border-2 border-primary bg-primary text-zinc-100 shadow-md opacity-90"
        >{translate(signUp)}</a></div>

        <div className="w-full bg-zinc-200 text-lg text-center text-zinc-800">
          <div className={"flex justify-center align-center"} onClick={() => { setIsLearnMoreOpen(!isLearnMoreOpen) }}>
            <span className="pr-1">
              {translate(learnMore)}
            </span>
            <span className="flex justify-center align-center">
              {!isLearnMoreOpen && <DownSquareOutlined className="my-auto text-xl" />}
              {isLearnMoreOpen && <UpSquareOutlined className="my-auto text-xl" />}
            </span>
          </div>

          {isLearnMoreOpen && <div>
            <EmbeddedVideo url={"https://www.youtube.com/watch?v=6cn4dcdN7d4"} />
            <EmbeddedVideo url={"https://www.youtube.com/watch?v=yadskoNfbwI"} />
            <EmbeddedVideo url={"https://www.youtube.com/watch?v=-3iXgm-0Gik"} />
          </div>}
        </div>
      </div>

      {loading && <div>{`${translate(loadingText)}...`}</div>}
      {!loading && !error && <Table />}
    </div >
  );
}
