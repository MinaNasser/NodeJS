const http = require('http'); /// import http module
const fs = require('fs')
let users = ["ahmed", "ali", "negm", "ramdan"]
const server = http.createServer((req, res) => {

    let url = req.url.split('/');
    console.log(url);
    if (url[1] == "users" && req.method == "GET") {

        if (url.length == 3) {
            let index = url[2]
            if (index > users.length)
                res.write('NOT Found')

            else
                res.write(users[index]);

        }
        else
            res.write(JSON.stringify(users));
    }

    else if (req.url == "/home" && req.method == "GET") {
        let html = fs.readFileSync("./index.html", 'utf-8');
        // console.log(html)
        res.write(html)
    }
    else if (req.url == "/style.css" && req.method == "GET") {
        let html = fs.readFileSync("./style.css", 'utf-8');
        // console.log(html)
        res.write(html)
    }

    res.end();
})
server.listen(5000, () => {
    console.log("server is listen now");
})