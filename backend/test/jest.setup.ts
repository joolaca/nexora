process.env.NODE_ENV = "test";

process.env.MONGO_URI = process.env.MONGO_URI_TEST ?? "mongodb://mongo:27017/nexora_test";
jest.setTimeout(30000);