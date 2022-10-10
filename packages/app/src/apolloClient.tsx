import { ApolloClient, InMemoryCache } from "@apollo/client";

const PRODUCTION_SERVER =
  "http://ec2-54-86-234-255.compute-1.amazonaws.com:4000";

const LOCALHOST_SERVER = "http://localhost:4000/";

const apolloClient = new ApolloClient({
  uri: PRODUCTION_SERVER,
  cache: new InMemoryCache(),
});

export default apolloClient;
