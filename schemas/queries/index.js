const { GraphQLObjectType } = require("graphql");
const { clientQueries } = require('./clients')
const { itemQueries } = require('./items')
const { orderQueries } = require('./orders')

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    type: "Query",
    fields: {
        ...itemQueries,
        ...clientQueries,
        ...orderQueries
    }
});

exports.query = RootQuery;