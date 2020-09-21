"use strict";
const graphql = require("graphql");
const express = require("express");
const bodyParser = require("body-parser");
const expressGraphQl = require("express-graphql");
const { GraphQLSchema } = graphql;
const { query } = require("./schemas/queries/index");
const { mutation } = require("./schemas/mutations/index");

const schema = new GraphQLSchema({
  query,
  mutation
});

var app = express();

app.use(bodyParser.json());

app.use(
  '/graphql',
  expressGraphQl({
    schema: schema,
    graphiql: true
  })
);

app.listen(3000, () =>
  console.log('GraphQL server running on localhost:3000')
);