const { dateScalar } = require("./scalars.ts");

const contentItems = [
  {
    key: 1,
    title: "#59: Listener Survey 2022 & Political change",
    creator: "The Bitcoin Cash Podcast",
    publicationDate: new Date(2022, 8, 13),
    videoId: "qyUKMhARnps",
    description:
      "Jett and I discuss all of the listener survey results and feedback, testing out the Alpha release of AnyHedge, the AVAX drama and the changing political tides around the world..",
    donationBchAddress:
      "bitcoincash:qpagvpjs32etwhv2hn75vdqyhckqs83w4unacjfjsa",
  },
  {
    key: 2,
    title: "Who Killed Bitcoin?",
    creator: "La Eterna Vigilante",
    publicationDate: new Date(2022, 0, 11),
    videoId: "eafzIW52Rgc",
    description:
      "A 45 minute documentary explaining money, power and the history of Bitcoin.",
  },
];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Date: dateScalar,
  Query: {
    content: () => contentItems,
  },
};

module.exports = resolvers;
