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
    startManager();
});

function startManager() {
    inquirer
        .prompt({
            name: "managerMenu",
            type: "list",
            message: "Choose an option below:",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "EXIT"]
        })
        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            if (answer.managerMenu === "View Products for Sale") {
                displayItem();
            } else if (answer.managerMenu === "View Low Inventory") {
                lowQuantity();
            } else if (answer.managerMenu === "Add to Inventory") {
                addQuantity();
            } else if (answer.managerMenu === "Add New Product") {
                addProduct();
            } else {
                connection.end();
            }
        });
}

function displayItem() {
    console.log("Selecting all products...\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        console.table("\n====================================================\n")
        startManager();
    });
}

function lowQuantity() {
    connection.query("SELECT * FROM products WHERE stock_quantity <= ?", [5], function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table("\n====================================================\n")
        console.table(res);
        console.table("\n====================================================\n")
        startManager();
    });
}

function addQuantity() {

    inquirer
        .prompt([{
            name: "chooseID",
            type: "input",
            message: "Please enter the Item ID which you want to update the quantity. [or q to quit]",
            validate: function (value) {
                // return !isNaN(value) || value.toLowerCase() === "q";
                if (!isNaN(value) === true) {
                    return true;
                } else if (value.toLowerCase() === "q") {
                    process.exit(0);
                }
            }
        }, {
            name: "addInv",
            type: "input",
            message: "How many you want to add into this item?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }])
        .then(function (answer) {

            var query = connection.query(

                "UPDATE products SET stock_quantity = stock_quantity + ? WHERE ?",
                [answer.addInv,
                    {
                        item_id: answer.chooseID
                    }
                ],
                function (error) {
                    if (error) throw err;
                    console.log("Quantity added!");
                    console.table("\n====================================================\n")
                    startManager();
                }
            );
            console.log(query.sql);
        });
}

function addProduct() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        inquirer
            .prompt([{
                    name: "department",
                    type: "list",
                    choices: function () {
                        var departments = [];
                        for (var i = 0; i < results.length; i++) {
                            if (departments.indexOf(results[i].department_name) === -1) {
                                departments.push(results[i].department_name);
                            }
                        }
                        return departments;
                    },
                    message: "What department would you like to place your item in?"
                }, {
                    name: "item",
                    type: "input",
                    message: "What is the item you would like to submit?",
                },
                {
                    name: "price",
                    type: "input",
                    message: "What is the price for new item per unit?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "What is the quantity for new item?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                }
            ])
            .then(function (answer) {
                // when finished prompting, insert a new item into the db with that info
                connection.query(
                    "INSERT INTO products SET ?", {
                        product_name: answer.item,
                        department_name: answer.department,
                        price: answer.price,
                        stock_quantity: answer.quantity
                    },
                    function (err) {
                        if (err) throw err;
                        console.log("New Item was created successfully!");
                        // re-prompt the user for if they want to bid or post
                        startManager();
                    }
                );
            });
    });
}