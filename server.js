const { openingQuestion, addDept, addRole, addEmployee, updateRole } = require('./lib/questions')
const inquirer = require('inquirer')
const mysql = require('mysql2');
const cTable = require('console.table')

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: ***REMOVED***,
    database: ***REMOVED***
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
            viewAllDept();
        } else if (choice === 'View All Roles') {
            viewAllRoles();
        } else if (choice === 'View All Employees') {
            viewAllEmployees();
        } else if (choice === 'Add a Department') {
            addToTable(addDept, 'departments');
        } else if (choice === 'Add a Role') {
            addToTable(addRole, 'roles');
        } else if (choice === 'Add an Employee') {
            addToTable(addEmployee, 'employees');
        } else if (choice === 'Update an Employee Role') {
            updateRoleFunct(updateRole);
        } else {
            connection.end();
        }
    });
};

// Need joins and possibly need different functions for each group.
viewAllDept = () => {
    connection.query(
        `SELECT * FROM departments`,
        function(err, results) {
          if (err) throw err;
          console.table(results); 
          listQuestions();
        }
    );
};

viewAllRoles = () => {
    connection.query(
        `SELECT * 
        FROM roles
        LEFT JOIN departments
        ON roles.department_id = departments(id)`,
        function(err, results) {
          if (err) throw err;
          console.table(results); 
          listQuestions();
        }
    );
};

viewAllEmployees = () => {
    connection.query(
        `SELECT * FROM employees
        LEFT JOIN roles
        ON employees.role_id = roles(id)`,
        function(err, results) {
          if (err) throw err;
          console.table(results); 
          listQuestions();
        }
    );
};

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
};

updateRoleFunct = (question) => {
    inquirer.prompt(question)
    .then(response => {
            connection.query(
                //need a function to map through the employees to grab their id
                'INSERT INTO employees WHERE id= ? SET ?',
                {
                    //need a function to map through the table and grab the id
                    id: response.id,
                    // need a function to map through the roles and grab the id of the matching one.
                    role_id: response.role
                },
                function(err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + ' updated!\n');
                    listQuestions();
                }
            );
    });
};