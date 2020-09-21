const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLInt, GraphQLInputObjectType, GraphQLList } = graphql;

const ClientType = new GraphQLObjectType({
  name: "Client",
  type: "Query",
  fields: {
    clientId: { type: GraphQLString },
    name: { type: GraphQLString },
    establishmentName: { type: GraphQLString },
    phoneNumber: { type: GraphQLString },
    whatsapp: { type: GraphQLString },
    email: { type: GraphQLString },
    address: { type: GraphQLString },
    CFP: { type: GraphQLString },
    CNPJ: { type: GraphQLString },
    CPF: { type: GraphQLString },
  }
});

const ItemType = new GraphQLObjectType({
  name: "Item",
  type: "Query",
  fields: {
    itemId: { type: GraphQLString },
    name: { type: GraphQLString },
    unitPrice: { type: GraphQLFloat },
  }
});

const BasketItemType  = new GraphQLObjectType({
  name: "BasketItem",
  type: "Query",
  fields: {
    item: { type: ItemType },
    order: { type: GraphQLString },
    quantity: { type: GraphQLInt },
    unitPrice: { type: GraphQLFloat }
  }
});

const OrderType = new GraphQLObjectType({
  name: "Order",
  type: "Query",
  fields: {
    orderId: { type: GraphQLString },
    client: { type: ClientType },
    orderNumber: { type: GraphQLString },
    totalPrice: { type: GraphQLFloat },
    date: { type: GraphQLString },
    basket : { type: new GraphQLList(BasketItemType) }
  }
});


exports.ClientType = ClientType;
exports.ItemType = ItemType;
exports.OrderType = OrderType;
exports.BasketItemType = BasketItemType;