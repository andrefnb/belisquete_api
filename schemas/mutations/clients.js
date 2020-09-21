const graphql = require("graphql");
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLList } = graphql;
const { ClientType } = require("./../types");
const db = require("../../database").db;
const moment = require("moment");

const clientMutations = {
    addClient: {
        type: ClientType,
        args: {
            name: { type: GraphQLString },
            establishmentName: { type: GraphQLString },
            phoneNumber: { type: GraphQLString },
            whatsapp: { type: GraphQLString },
            email: { type: GraphQLString },
            address: { type: GraphQLString },
            CFP: { type: GraphQLString },
            CNPJ: { type: GraphQLString },
            CPF: { type: GraphQLString },
        },
        resolve(parentValue, args) {
            const query = `INSERT INTO client("name", "establishmentName", "phoneNumber", "whatsapp", "email", "address", "CFP", "CNPJ", "CPF") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING "clientId", "name", "establishmentName", "phoneNumber", "whatsapp", "email", "address", "CFP", "CNPJ", "CPF"`;
            const values = [
                args.name,
                args.establishmentName,
                args.phoneNumber,
                args.whatsapp,
                args.email,
                args.address,
                args.CFP,
                args.CNPJ,
                args.CPF
            ];

            try {

                return db.one(query, values)

            } catch (err) {
                return queryErrorHandling(err)
            }

        }
    },
    editClient: {
        type: ClientType,
        args: {
            clientId: { type: GraphQLID },
            name: { type: GraphQLString },
            establishmentName: { type: GraphQLString },
            phoneNumber: { type: GraphQLString },
            whatsapp: { type: GraphQLString },
            email: { type: GraphQLString },
            address: { type: GraphQLString },
            CFP: { type: GraphQLString },
            CNPJ: { type: GraphQLString },
            CPF: { type: GraphQLString },
        },
        resolve(parentValue, args) {

            let query = 'UPDATE client SET "name" = $2, "establishmentName" = $3, "phoneNumber" = $4, "whatsapp" = $5, "email" = $6, "address" = $7, "CFP" = $8, "CNPJ" = $9, "CPF" = $10 '
            query += 'WHERE "clientId" = $1 RETURNING "clientId", "name", "establishmentName", "phoneNumber", "whatsapp", "email", "address", "CFP", "CNPJ", "CPF"';
            const values = [
                args.clientId,
                args.name,
                args.establishmentName,
                args.phoneNumber,
                args.whatsapp,
                args.email,
                args.address,
                args.CFP,
                args.CNPJ,
                args.CPF,
            ];

            try {

                return db.one(query, values)

            } catch (err) {
                return queryErrorHandling(err)
            }

        }
    },
    deleteClient: {
        type: ClientType,
        args: {
            clientId: { type: GraphQLID },
        },
        resolve(parentValue, args) {

            const query = `UPDATE client SET enabled=false WHERE "clientId" = $1 RETURNING "clientId", "name", "establishmentName", "phoneNumber", "whatsapp", "email", "address", "CFP", "CNPJ", "CPF"`;
            const values = [
                args.clientId
            ];

            try {

                return db.one(query, values)

            } catch (err) {
                return queryErrorHandling(err)
            }

        }
    },
}

exports.clientMutations = clientMutations;