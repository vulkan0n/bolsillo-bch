import { useState, useEffect } from 'react';
import { DateTime } from "luxon";

export default function ExploreAfogView() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const afogEndpoint = "https://afifthofgaming.com/Session/GetTournaments"

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch('http://cors-anywhere.herokuapp.com/https://afifthofgaming.com/Session/GetTournaments');
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  console.log({ tournaments })

  const Table = () => {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Upcoming Tournaments</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all the users in your account including their name, title, email and role.
            </p>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date<br />
                      starts in...
                    </th>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      Game (Guild)
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Prize Pool
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Players
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tournaments && tournaments.map(({ id, game, prize, players, date, timeUntilStartDisplay, ...data }) => {
                    const title = data.cycle.game.title
                    const guild = data.cycle.guild.name

                    return (
                      <tr key={id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {date}<br />
                          in {timeUntilStartDisplay}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {title}
                          <br />
                          ({guild})
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{prize}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{players}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"></td>
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


  return (
    <div>
      <div>Compete in online video game tournaments, with entry fees & prizes paid directly in BCH!</div>
      <div>Read more at <a href="https://afifthofgaming.com/" target="_blank">https://afifthofgaming.com/</a></div>

      <Table />
    </div>
  );
}
