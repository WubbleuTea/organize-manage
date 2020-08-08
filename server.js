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
            addToTable(addDept, 'departments');
        } else if (choice === 'Add a Role') {
            addToTable(addRole, 'roles');
        } else if (choice === 'Add an Employee') {
            addToTable(addEmployee, 'employees');
        } else {
            connection.end();
        }
    });
};

// Need joins and possibly needed different 
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

addToTable = (question, table) => {
    inquirer.prompt(question)
    .then(response => {
        if (question[0].name === 'addDepart') {
            connection.query(
                'INSERT INTO departments SET ?',
                {
                    department_name: response.addDepart
                },
                function(err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + ' added!\n');
                    listQuestions();
                }
            );
        } else if (question[0].name === 'name') {
            connection.query(
                'INSERT INTO roles SET ?',
                {
                    title: response.addDepart,
                    salary: response.salary,
                    //this will need to be a function to get the id
                    department_id: response.depart
                },
                function(err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + ' added!\n');
                    listQuestions();
                }
            );
        } else if (question[0].name === 'firstName') {
            connection.query(
                'INSERT INTO employees SET ?',
                {
                    first_name: response.firstName,
                    last_name: response.lastName,
                    //this will need to be a function to get the id for these too.
                    role_id: response.role,
                    manager_id: response.manger
                },
                function(err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + ' added!\n');
                    listQuestions();
                }
            );
        }
    })
}