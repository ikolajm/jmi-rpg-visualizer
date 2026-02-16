import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
const typeDefs = {
// ...PlayerCharacterSchema
};
// @ts-ignore
const server = new ApolloServer({});
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
});
console.log(`Server running on port: ${url}`);
