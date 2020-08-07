const { openingQuestion, addDept, addRole, addEmployee, updateRole } = require('./lib/questions')
const inquirer = require('inquirer')
const mysql = require('mysql2');
const cTable = require('console.table')

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: ***REMOVED***,
    database: 'teamDB'
});
// connects to mysql and begins the program.
connection.connect(err => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
    startUp();
});
// Creates the image, starts the connection and goes to first list of questions.
startUp = () => {
    console.log('Employee Table')
    listQuestions();
};
// list of questions are asked
listQuestions = () => {
    inquirer.prompt(openingQuestion)
    .then(answer => {
        let choice = answer.firstQuestion
        console.log(`this is the answer ${choice}`)
        if (choice === 'View All Departments') {
            viewAll('departments');
        } else if (choice === 'View All Roles') {
            viewAll('roles');
        } else if (choice === 'View All Employees') {
            viewAll('employees');
        } else if (choice === 'Add a Department') {
            addToTable('addDept', 'departments');
        } else if (choice === 'Add a Role') {
            addToTable('addRole', 'roles');
        } else if (choice === 'Add an Employee') {
            addToTable('addEmployee', 'employees');
        } else {

            connection.end();
        }
       
    });
};

// Departments are shown
viewAll = type => {
    console.log(`this is the type ${type}`)
    connection.query(
        `SELECT * FROM ${type}`,
        function(err, results) {
          if (err) throw err;
          console.table(results); 
          listQuestions();
        }
      );
}

addToTable = (funct, table) => {
    console.log(`Updating ${table}`)
    console.log(`Using this function: ${funct}`)
    inquirer.prompt(funct)
    .then(response => { 
        if (funct === 'addDept') {
            connection.query(
                'INSERT INTO departments SET ?',
                {
                    departement_name: response.addDepart
                },
            function(err, res) {
                console.log('I made it into the connection')
                if (err) throw err;
                console.log(res.affectedRows + ' added!\n');
                // Call updateProduct() AFTER the INSERT completes
                listQuestions();
              }
            );
        } else if (funct === 'addRole') {
            console.log("adding role")
        } else if (funct === 'addEmployee') {
            console.log('adding employee')
        
        }
    })
}