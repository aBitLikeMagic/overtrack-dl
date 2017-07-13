import {makeServer} from './server';

const server = makeServer();
const listener = server.listen(process.env.PORT || 8080, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
