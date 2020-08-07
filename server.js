const { openingQuestion, addDept, addRole, addEmployee, updateRole } = require('./lib/questions')
const inquirer = require('inquirer')
const mysql = require('mysql2');
const cTable = require('console.table')

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3001,
    // Your MySQL username
    user: 'root',
    // Your MySQL password
    password: ***REMOVED***,
    database: 'ice_creamDB'
});
// Creates the imag, starts the connection and goes to first list of questions.
const startUp = () => {
    console.log('Employee Table')
    connection.connect(err => {
        if (err) throw err;
        console.log('connected as id ' + connection.threadId);
        listQuestions();
      });

}
// list of questions are asked
const listQuestions = () => {
    inquirer.prompt(openingQuestion)
    .then(function(answer) {
        if (answer == 'view all departments') {
            viewAll('departments');
        }
       
    });
};

// Departments are shown
const viewAll = (type) => {
    connection.query(
        'SELECT * FROM ?',
        {
            type
        },
        function(err, results) {
          if (err) throw err;
          console.table(results); 
          listQuestions();
        }
      );
}

startUp()