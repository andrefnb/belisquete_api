const { db } = require("../../database");
const { GraphQLID, GraphQLList } = require("graphql");
const { ClientType } = require("./../types");
const { queryErrorHandling } = require('./../../utils')

const getClient = async (clientId, enabled = true) => {
    let query = `SELECT * FROM "client" WHERE "clientId"=$1`;
    if (enabled) query += ' AND enabled=true'
    let values = [clientId]
    return await db.one(query, values)
}

const clientQueries = {
    client: {
        type: ClientType,
        args: { clientId: { type: GraphQLID } },
        async resolve(parentValue, args) {

            try {

                return await getClient(args.clientId)

            } catch (err) {
                return queryErrorHandling(err)
            }

        }
    },
    clients: {
        type: new GraphQLList(ClientType),
        args: {},
        resolve(parentValue, args) {

            const query = `SELECT * FROM client WHERE enabled=true`;

            try {

                return db.query(query)

            } catch (err) {
                return queryErrorHandling(err)
            }

        }
    },
}

exports.clientQueries = clientQueries;
exports.getClient = getClient;