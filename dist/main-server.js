"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const server = server_1.makeServer();
const listener = server.listen(process.env.PORT || 8080, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});
