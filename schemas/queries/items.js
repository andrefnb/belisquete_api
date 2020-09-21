const { db } = require("../../database");
const { GraphQLID, GraphQLList } = require("graphql");
const { ItemType } = require("./../types");
const { queryErrorHandling } = require('./../../utils')

const getItem = async (itemId, enabled = true) => {
    let query = `SELECT * FROM "item" WHERE "itemId"=$1`;
    if (enabled) query += ' AND enabled=true'
    let values = [itemId]
    return await db.one(query, values)
}

const itemQueries = {
    item: {
        type: ItemType,
        args: { itemId: { type: GraphQLID } },
        async resolve(parentValue, args) {

            try {

                return await getItem(args.itemId)

            } catch (err) {
                return queryErrorHandling(err)
            }

        }
    },
    items: {
        type: new GraphQLList(ItemType),
        args: {},
        resolve(parentValue, args) {

            const query = `SELECT * FROM item`;

            try {

                return db.query(query)

            } catch (err) {
                return queryErrorHandling(err)
            }

        }
    },
}

exports.itemQueries = itemQueries;
exports.getItem = getItem;