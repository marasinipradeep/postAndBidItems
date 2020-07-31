const mysql = require("mysql")
const inquirer = require("inquirer")


//Basic database settings
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "*****",//put your password
    database: "greatbay_db" //create database using Mysql workbench
});


//connect database
connection.connect((err) => {
    if (err) throw err;
    console.log("Database connected");
    askQuestion();
})

//ask user questions on initial start

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


//If user chooses to post an item
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


//If user chooses to bid an item
function bidItem() {

    connection.query("SELECT * FROM auctions", (err, results) => {
        if (err) throw err;
        console.log(results)

        //Once you have an item prompt user which item they want

        inquirer.prompt([{
            name: "choices",
            type: "rawlist",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < results.length; i++) {
                    choiceArray.push(results[i].item_name);
                }
                return choiceArray;
            },
            message: "What auction would you like to place a bid in ?"
        },
        {
            name: "bid",
            type: "input",
            message: "How much would you like to bid ?"
        }
        ])
            .then((answer) => {

                //get the information of choosen item
                var choosenItem;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].item_name === answer.choices) {
                        choosenItem = results[i]

                        console.log("choosen item is " + choosenItem)
                    }
                }

                //Determine if bid was high enough
                if (choosenItem.highest_bid < parseInt(answer.bid)) {
                    //bid is high so upadte table inform the user and start again
                    connection.query("UPDATE auctions SET ? WHERE ?",

                        [
                            {
                                highest_bid: answer.bid
                            },
                            {
                                id: choosenItem.id
                            }
                        ],
                        function (err) {
                            if (err) throw err;
                            console.log("Bid place successfully");
                            askQuestion();
                        }
                    );
                }
                else {
                    //bid was less then original bid
                    console.log("your bid is less then others bid")
                    askQuestion()
                }
            })
    })
}