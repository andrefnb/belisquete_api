const { db } = require("../../database");
const { GraphQLID, GraphQLList } = require("graphql");
const { OrderType } = require("./../types");
const { queryErrorHandling } = require('./../../utils')
const { getClient } = require('./clients')
const { getItem } = require('./items')

const getOrder = async (orderId) => {
    let query = `SELECT * FROM "order" WHERE "orderId"=$1`;
    let values = [orderId]
    return await db.one(query, values)
}

const orderQueries = {
    order: {
        type: OrderType,
        args: { orderId: { type: GraphQLID } },
        async resolve(parentValue, args) {

            try {

                let res = await getOrder(args.orderId)

                res.client = await getClient(res.client)

                const basketQuery = `SELECT * FROM "order_item" WHERE "order"=$1`;
                const basketValues = [args.orderId];

                let = basketRes = await db.query(basketQuery, basketValues)

                res.basket = basketRes.map(async baskItem => {
                    baskItem.item = await getItem(baskItem.item, false)
                    return baskItem
                })

                return res

            } catch (err) {
                return queryErrorHandling(err)
            }

        }
    },
    orders: {
        type: new GraphQLList(OrderType),
        args: {
            clientId: { type: GraphQLID },
            // itemId: { type: GraphQLID },
        },
        async resolve(parentValue, args) {
            let query = `SELECT * FROM "order"`;

            let filterToAdd = ''
            let values = []
            if (args.clientId) {
                filterToAdd += ' WHERE "client"=$1'
                values.push(args.clientId)
            }
            query += filterToAdd

            try {

                let res = await db.query(query, values)

                for (order of res) {

                    order.client = await getClient(order.client, false)

                    const basketQuery = `SELECT * FROM "order_item" WHERE "order"=$1`;
                    const basketValues = [order.orderId];

                    let basketRes = await db.query(basketQuery, basketValues)

                    order.basket = basketRes.length > 0 ? basketRes.map(async baskItem => {
                        baskItem.item = await getItem(baskItem.item, false)
                        return baskItem
                    }) : []

                }

                return res

            } catch (err) {
                return queryErrorHandling(err)
            }

        }
    },
}

exports.orderQueries = orderQueries;
exports.getOrder = getOrder;