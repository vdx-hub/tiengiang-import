
import 'dotenv/config'
import { ConnectOptions, MongoClient } from 'mongodb';
const _client = new MongoClient(process.env.MONGODB_URI || '', {
  useUnifiedTopology: false,
  useNewUrlParser: true,
  connectTimeoutMS: 10000,
  server: { auto_reconnect: true },
} as ConnectOptions);
_client.connect();
export { _client }


