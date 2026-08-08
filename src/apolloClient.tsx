import { ApolloClient, InMemoryCache } from "@apollo/client";

const PRODUCTION_SERVER = "https://stats.selene.cash/"; // TODO: replace with bolsillo stats server when available

//const LOCALHOST_SERVER = "http://localhost:4000/";

const apolloClient = new ApolloClient({
  //uri: LOCALHOST_SERVER,
  uri: PRODUCTION_SERVER,
  cache: new InMemoryCache(),
});

export default apolloClient;
