
import { log } from 'console';
import 'dotenv/config'
import { ConnectOptions, MongoClient } from 'mongodb';
const _client = new MongoClient(process.env.MONGODB_URI || '', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  connectTimeoutMS: 10000,
} as ConnectOptions);
_client.connect();
_client.on("serverOpening", (e) => {
  log('serverOpening', e)
})
export { _client }


