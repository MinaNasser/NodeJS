bconst fs = require("fs"); // import 
const readLine = require('readline');

const r1 = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
})
const b = require('bcrypt');
const clac = require('./clac');


function ask(q) {
    return new Promise(function (resolve, reject) {

        r1.question(q, function (data) {
            resolve(data);
        })
    })
}

async function main() {
    let name = await ask('enter name');
    let age = await ask('enter age');
    console.log(`${name} + ${age}`)
    r1.close();

}

main()
// b.hash("hi from node", 5, function (err, data) {
//     console.log(data);
// })
// fs.appendFile("text.txt", "hi from cfgggguhuh", function (err) {
//     if (err) {
//         console.log(err)
//     }
//     else
//         console.log("done")
// });
// // console.log("first")

// let data = fs.readFile("text.txt", 'utf-8', function (err, data) {
//     console.log(data);
// })
// console.log(data);

// console.log("sssgvgv")
