const graphql = require("graphql");
const { GraphQLObjectType } = graphql;
const { orderMutations } = require('./orders')
const { itemMutations } = require('./items')
const { clientMutations } = require('./clients')

const RootMutation = new GraphQLObjectType({
    name: "RootMutationType",
    type: "Mutation",
    fields: {
        ...itemMutations,
        ...clientMutations,
        ...orderMutations,
        
    }
});

exports.mutation = RootMutation;