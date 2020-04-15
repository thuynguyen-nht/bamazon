var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

function start() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        // once you have the items, prompt the user for which they'd like to bid on
        inquirer
            .prompt([{
                    name: "choice",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].product_name);
                        }
                        return choiceArray;
                    },
                    message: "What product would you like to buy?"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "What quantity you want to order? [or q to quit]",
                    validate: function (val) {
                        return val > 0 || val.toLowerCase() === "q";
                    }
                }
            ])
            .then(function (answer) {

                checkIfShouldExit(answer.quantity);
                // get the information of the chosen item
                var chosenItem;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].product_name === answer.choice) {
                        chosenItem = results[i];
                        // console.log(chosenItem);
                    }
                }

                // determine if bid was high enough
                if (chosenItem.stock_quantity > parseInt(answer.quantity)) {

                    var remaining = chosenItem.stock_quantity - answer.quantity;

                    console.log("Remaining stocks for " + answer.choice + " is " + remaining);

                    var total = chosenItem.price * answer.quantity;

                    var query = connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [{
                                stock_quantity: remaining
                            },
                            {
                                item_id: chosenItem.item_id
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                            console.log("Order placed successfully!");
                            console.log("Your total: $" + total);
                            start();
                        }
                    );
                    //this is to check the sql
                    // console.log(query.sql);
                } else {
                    // quantity wasn't enough, so apologize and start over
                    console.log("Insufficient. Try again...");
                    start();
                }
            });
    });
}
// Check to see if the user wants to quit the program
function checkIfShouldExit(choice) {
    if (choice.toLowerCase() === "q") {
        // Log a message and exit the current node process
        console.log("Goodbye!");
        process.exit(0);
    }
}