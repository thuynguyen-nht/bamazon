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

        connection.end();
    });
}