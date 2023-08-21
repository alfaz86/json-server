// JSON Server module
const jsonServer = require("json-server");
const fs = require('fs')
const path = require('path')

const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db/db.json')))
const server = jsonServer.create();
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();

server.use(middlewares);
// Add this before server.use(router)
server.use(
	// Add custom route here if needed
	jsonServer.rewriter({
		"/api/*": "/$1",
	})
);
server.use(router);
server.listen(3000, () => {
	console.log("JSON Server is running");
});

// Export the Server API
module.exports = server;
