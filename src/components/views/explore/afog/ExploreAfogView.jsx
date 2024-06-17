export default function ExploreAfogView() {
  // const up

  const tournaments = [
    {
      id: 1,
      game: 'Magic: The Gathering Arena',
      guild: 'MTGADailyChallenge',
      prize: '$22',
      players: '7',
      date: '06/17/2024',
      startsIn: '12 hours'
    },
    {
      id: 2,
      game: 'Magic: The Gathering Arena',
      guild: 'MTGADailyChallenge',
      prize: '$31',
      players: '3',
      date: '06/17/2024',
      startsIn: '15 hours'
    },
    // More people...
  ]

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
                      Date
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
                  {tournaments.map(({ id, game, guild, prize, players, date, startsIn }) => (
                    <tr key={id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {date}<br />
                        in {startsIn}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {game}
                        <br />
                        {guild}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{prize}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{players}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
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
