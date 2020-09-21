const graphql = require("graphql");
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLList } = graphql;
const { OrderType } = require("./../types");
const { BasketItemInput } = require("./../inputs");
const db = require("../../database").db;
const moment = require("moment");
const { getOrder } = require('../queries/orders')
const { getClient } = require('../queries/clients')
const { getItem } = require('../queries/items')

const getOrderNumber = async (clientId, db) => {

    let getUserCount = `SELECT * FROM "order" WHERE "client"=${clientId};`

    let resGet = await db.query(getUserCount)

    let numberOfOrders = resGet.length

    // Stringify number and add left 0s
    let numberString = String(numberOfOrders + 1)
    switch (numberString.length) {
        case 1: numberString = `000${numberString}`; break
        case 2: numberString = `00${numberString}`; break
        case 3: numberString = `0${numberString}`
    }

    // Add /year ex: 0001/19
    numberString = `${numberString}/${moment().format("YY")}`
    return numberString

}

const getBasket = async (orderId, db) => {

    let query = `SELECT * FROM "order_item" WHERE "order"=${orderId};`

    return await db.query(query)

}

const createBasketItem = async (itemId, orderId, quantity, unitPrice) => {

    const queryBask = `INSERT INTO "order_item"("item", "order", "quantity", "unitPrice") VALUES ($1, $2, $3, $4) RETURNING "item", "order", "quantity", "unitPrice"`;

    const valuesBask = [
        itemId,
        orderId,
        quantity,
        unitPrice,
    ];

    return await db.one(queryBask, valuesBask)

}

const toDisplayBasket = async (basket) => {

    let newBasket = basket.map(async el => {

        let newEl = JSON.parse(JSON.stringify(el))
        newEl.item = await getItem(el.item, false)

        return newEl
    })

    return newBasket

}

const orderMutations = {
    addOrder: {
        type: OrderType,
        args: {
            clientId: { type: GraphQLID },
            totalPrice: { type: GraphQLFloat },
            basket: { type: new GraphQLList(BasketItemInput) }
        },
        async resolve(parentValue, args) {

            try {

                let orderNumber = await getOrderNumber(args.clientId, db)

                let date = moment().format('DD/MM/YYYY HH:mm')

                const query = `INSERT INTO "order"("client", "orderNumber", "totalPrice", "date") VALUES ($1, $2, $3, $4) RETURNING "orderId", "client", "orderNumber", "totalPrice", "date"`;

                const values = [
                    args.clientId,
                    orderNumber,
                    args.totalPrice,
                    date
                ];

                let res = await db.one(query, values)

                let basket = args.basket

                // Create basket
                let returnBask = []

                for (let it of basket) {

                    let itemRes = await createBasketItem(it.item, res.orderId, it.quantity, it.unitPrice)

                    returnBask.push(itemRes)

                }

                res.basket = await toDisplayBasket(returnBask)
                res.client = await getClient(res.client)

                return res

            } catch (e) {
                return queryErrorHandling(e)
            }

        }
    },
    editOrder: {
        type: OrderType,
        args: {
            orderId: { type: GraphQLID },
            clientId: { type: GraphQLID },
            totalPrice: { type: GraphQLFloat },
            basket: { type: new GraphQLList(BasketItemInput) }
        },
        async resolve(parentValue, args) {

            try {

                let order = await getOrder(args.orderId)

                let orderNumber = order.orderNumber

                if (String(order.client) != String(args.clientId)) {
                    orderNumber = await getOrderNumber(args.clientId, db)
                }

                const query = `UPDATE "order" SET "client" = $2, "orderNumber" = $3, "totalPrice" = $4, "date" = $5 WHERE "orderId"=$1 RETURNING "orderId", "client", "orderNumber", "totalPrice", "date"`;
                const values = [
                    args.orderId,
                    args.clientId,
                    orderNumber,
                    args.totalPrice,
                    order.date,
                ];

                // Basket Edit
                let displayBasket = []
                let oldBasket = await getBasket(args.orderId, db)

                // Update or delete old ones
                for (let oldItem of oldBasket) {

                    let row = args.basket.find(el => String(el.item) == String(oldItem.item))
                    if (!!row) {
                        // Update
                        if (row.quantity != oldItem.quantity || row.unitPrice != oldItem.unitPrice) {
                            let queryUpdate = `UPDATE "order_item" SET "quantity" = $3, "unitPrice" = $4 WHERE "item"=$1 AND "order" = $2 RETURNING "item", "order", "quantity", "unitPrice"`
                            let valuesUpdate = [
                                oldItem.item,
                                oldItem.order,
                                row.quantity,
                                row.unitPrice
                            ]
                            let rowUpdated = await db.one(queryUpdate, valuesUpdate)
                            displayBasket.push(rowUpdated)

                        } else {
                            // Put for display
                            displayBasket.push(oldItem)
                        }

                    } else {
                        // Delete
                        let queryDelete = `DELETE FROM "order_item" WHERE "item"=$1 AND "order" = $2 RETURNING "item", "order", "quantity", "unitPrice"`
                        let valuesDelete = [
                            oldItem.item,
                            oldItem.order
                        ]
                        db.one(queryDelete, valuesDelete)
                    }

                }

                // Create new ones
                for (let newItem of args.basket) {

                    let row = oldBasket.find(el => String(el.item) == String(newItem.item))

                    if (!row) {
                        // Create
                        let rowCreated = await createBasketItem(newItem.item, order.orderId, newItem.quantity, newItem.unitPrice)
                        displayBasket.push(rowCreated)
                    }

                }

                let resEdit = await db.one(query, values)

                resEdit.client = await getClient(resEdit.client)

                resEdit.basket = await toDisplayBasket(displayBasket)

                return resEdit

            } catch (err) {
                return queryErrorHandling(err)
            }

        }
    },
    deleteOrder: {
        type: OrderType,
        args: {
            orderId: { type: GraphQLID },
        },
        async resolve(parentValue, args) {

            try {

                // Delete basket
                const basketQuery = `DELETE FROM "order_item" WHERE "order"=$1`;
                const basketValues = [
                    args.orderId
                ]

                let resBasket = await db.query(basketQuery, basketValues)

                const query = `DELETE FROM "order" WHERE "orderId"=$1 RETURNING "orderId", "client", "orderNumber", "totalPrice", "date"`;
                const values = [
                    args.orderId
                ];


                return db.one(query, values)

            } catch (err) {
                return queryErrorHandling(err)
            }

        }
    }
}

exports.orderMutations = orderMutations;