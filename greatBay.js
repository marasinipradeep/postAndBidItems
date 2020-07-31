const mysql = require("mysql")
const inquirer = require("inquirer")

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "alterPassword",
    database: "greatbay_db"
});

connection.connect((err) => {
    if (err) throw err;
    console.log("Database connected");
    askQuestion();
})

function askQuestion() {
    inquirer.prompt(
        {
            message: "What you are going to do POST OR BID",
            name: "postOrbid",
            type: "list",
            choices: [
                "POST",
                "BID",
                "EXIT"
            ]

        }).then((response) => {
            console.log(response)
            if (response.postOrbid === "POST") {
                postItem()
            }
            else if (response.postOrbid === "BID") {
                bidItem()
            }
            else {
                connection.end()
            }
        })
}

function postItem() {
    inquirer.prompt([{
        message: "What is the name of Item?",
        name: "item_name",
        type: "input"
    },
    {
        message: "What is the price of Item?",
        name: "starting_bid",
        type: "input",
        validate: (value) => {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
        }

    }
    ])
        .then((bidAnswer) => {
            console.log(bidAnswer)
            connection.query("INSERT INTO auctions SET ?",
                {
                    item_name: bidAnswer.item_name,
                    starting_bid: bidAnswer.starting_bid || 0,
                    highest_bid: bidAnswer.starting_bid || 0
                }, (err) => {
                    if (err) throw err;
                    console.log("Your auction was created successfully")
                    askQuestion();
                }
            )
        })
}

function bidItem() {

    connection.query("SELECT * FROM auctions", (err, results) => {
        if (err) throw err;
        console.log(results)

        //Once you have an item prompt user which item they want


    })

}