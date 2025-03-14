// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
export const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    Headers: [String]
    Points: [Point]
    Point(where:PointFilter): Point
  }

  input PointFilter {
    address: String
  }

  type Point {
    rank: Int
    address: String
    points: Float
    supply_points: Float
  }

  type Mutation {
      _empty: String
  }
  type Subscription {
      _empty: String
  }
`;
