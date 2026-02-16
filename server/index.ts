import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// import PlayerCharacterSchema from "./api/PlayerCharacter/PlayerCharacter.schema.js";

const typeDefs: any[] = [
  // PlayerCharacterSchema
];

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    // resolvers,
  })

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  })

  console.log(`🚀 GraphQL server running at ${url}`)
}

startServer()