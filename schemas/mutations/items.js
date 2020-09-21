const graphql = require("graphql");
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLList } = graphql;
const { ItemType } = require("./../types");
const db = require("../../database").db;
const moment = require("moment");

const itemMutations = {
    addItem: {
        type: ItemType,
        args: {
            name: { type: GraphQLString },
            unitPrice: { type: GraphQLFloat },
        },
        resolve(parentValue, args) {

            const query = `INSERT INTO item("name", "unitPrice") VALUES ($1, $2) RETURNING "itemId", "name", "unitPrice"`;
            const values = [
                args.name,
                args.unitPrice
            ];

            try {

                return db.one(query, values)

            } catch (err) {
                return queryErrorHandling(err)
            }

        }
    },
    editItem: {
        type: ItemType,
        args: {
            itemId: { type: GraphQLID },
            name: { type: GraphQLString },
            unitPrice: { type: GraphQLFloat },
        },
        resolve(parentValue, args) {

            const query = `UPDATE item SET "name" = $2, "unitPrice" = $3 WHERE "itemId"=$1 RETURNING "itemId", "name", "unitPrice"`;
            const values = [
                args.itemId,
                args.name,
                args.unitPrice
            ];

            try {

                return db.one(query, values)

            } catch (err) {
                return queryErrorHandling(err)
            }

        }
    },
    deleteItem: {
        type: ItemType,
        args: {
            itemId: { type: GraphQLID },
        },
        resolve(parentValue, args) {

            const query = `UPDATE item SET enabled=false WHERE "itemId"=$1 RETURNING "itemId", "name", "unitPrice"`;
            const values = [
                args.itemId
            ];

            try {

                return db.one(query, values)

            } catch (err) {
                return queryErrorHandling(err)
            }

        }
    },
}

exports.itemMutations = itemMutations;