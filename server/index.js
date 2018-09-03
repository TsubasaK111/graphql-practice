const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data/pokemon.js");

// The schema should model the full data object available.
const schema = buildSchema(`
  type Pokemon {
    id: ID!
    name: String!
    classification: String
    types: [PokemonType]
    resistant: [String]
    weaknesses: [String]
    weight: PhysicalSpecs  
    height: PhysicalSpecs
    fleeRate: Float
    # TODO: Previous Evolution(s): [Evolution]
    evolutionRequirements: EvolutionRequirements
    evolutions: [Pokemon]
    maxCP: Int
    maxHP: Int
    attacks: Attacks
  }

  enum PokemonType {
    Grass
    Poison
    Fire
    Flying
    Water
    Bug
    Normal
    Electric
    Ground
    Fairy
    Fighting
    Psychic
    Rock
    Steel
    Ice
    Ghost
    Dragon
  }
  type PhysicalSpecs {
    minimum: String
    maximum: String
  }
  type EvolutionRequirements {
    amount: Int
    name: String
  }
  type Evolution {
    id: Int
    name: String
  }
  type Attacks {
    fast: [Attack]!
    special: [Attack]!
  }
  type Attack {
    name: String
    type: String
    damage: Int
  }


  type Query {
    AllPokemons: [Pokemon]
    Pokemons(
      type: PokemonType
      resistant: String
      weaknesses: String
    ): [Pokemon]
    Pokemon(name: String): Pokemon
    PokemonTypes: [String]
    Attacks: [Attack]
    Attack(name: String): Attack
  }


  input PokemonInput {
    id: ID
    name: String!
    classification: String
  }


  type Mutation {
    createPokemon(input: PokemonInput): Pokemon
    updatePokemon(id: ID!, input: PokemonInput): Pokemon
  }
`);

// The root provides the resolver functions for each type of query or mutation.
const root = {
  AllPokemons: () => {
    return data;
  },
  Pokemons: (request) => {
    return data.filter((pokemon) => {
      return (
        pokemon.types.includes(request.type) ||
        pokemon.weaknesses.includes(request.weaknesses) ||
        pokemon.resistant.includes(request.resistant)
      );
    });
  },
  Pokemon: (request) => {
    return data.find((pokemon) => pokemon.name === request.name);
  },
  PokemonTypes: () => {
    return data
      .map((pokemon) => pokemon.types)
      .reduce((acc, val) => acc.concat(val), []) //flattens
      .filter((type, i, types) => types.indexOf(type) === i);
  },
  Attacks: () => {
    return data
      .map((pokemon) => pokemon.attacks)
      .reduce((acc, attacks) => {
        return [...acc, ...attacks.fast, ...attacks.special];
      }, [])
      .filter((attack, i, attacks) => {
        return (
          attacks.findIndex(
            (firstAttack) => attack.name === firstAttack.name
          ) === i
        );
      });
  },
  Attack: (request) => {
    return data
      .map((pokemon) => pokemon.attacks)
      .reduce((acc, attacks) => {
        return [...acc, ...attacks.fast, ...attacks.special];
      }, [])
      .find((attacks) => attacks.name === request.name);
  },
  createPokemon: (request) => {
    data.push({
      id: request.input.id,
      name: request.input.name,
      classification: request.input.classification,
    });
    console.log(request.input.id);
  },
};

// Start your express server!
const app = express();

/*
  The only endpoint for your server is `/graphql`- if you are fetching a resource, 
  you will need to POST your query to that endpoint. Suggestion: check out Apollo-Fetch
  or Apollo-Client. Note below where the schema and resolvers are connected. Setting graphiql
  to 'true' gives you an in-browser explorer to test your queries.
*/
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);
app.listen(4000);

console.log("Running a GraphQL API server at localhost:4000/graphql");
