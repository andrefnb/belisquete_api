const graphql = require("graphql");
const { GraphQLID, GraphQLString, GraphQLFloat, GraphQLInt, GraphQLInputObjectType, GraphQLList } = graphql;

const BasketItemInput = new GraphQLInputObjectType({
    name: "BasketItemInput",
    type: "Query",
    fields: {
        item: { type: GraphQLID },
        order: { type: GraphQLString },
        quantity: { type: GraphQLInt },
        unitPrice: { type: GraphQLFloat }
    }
});

exports.BasketItemInput = BasketItemInput;