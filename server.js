const { openingQuestion, addDept, addRole, addEmployee, updateRole } = require('./lib/questions')
const inquirer = require('inquirer')
const mysql = require('mysql2');
const cTable = require('console.table')

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: ***REMOVED***,
    database: 'team_db'
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
        if (choice === 'View All Departments') {
            viewAllDept();
        } else if (choice === 'View All Roles') {
            viewAllRoles();
        } else if (choice === 'View All Employees') {
            viewAllEmployees();
        } else if (choice === 'Add a Department') {
            addToDept(addDept);
        } else if (choice === 'Add a Role') {
            addToRole(addRole);
        } else if (choice === 'Add an Employee') {
            addToEmployee(addEmployee);
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
        `SELECT roles.id, title, salary, department_name  
        FROM roles
        LEFT JOIN departments
        ON roles.department_id = departments.id`,
        function(err, results) {
          if (err) throw err.message;
          console.table(results); 
          listQuestions();
        }
    );
};


viewAllEmployees = () => {
    connection.query(
        `SELECT e.id, e.first_name, e.last_name, 
                r.title, d.department_name AS department, r.salary, 
                CONCAT(m.last_name, ', ', m.first_name) AS manager
            FROM employees AS e 
            INNER JOIN roles AS r
            ON e.role_id = r.id
            LEFT JOIN employees AS m
            ON e.manager_id = m.id
            INNER JOIN departments AS d
            ON r.department_id = d.id
            ORDER BY e.id;`,
        function(err, results) {
          if (err) throw err;
          console.table(results); 
          listQuestions();
        }
    );
};

addToDept = (question) => {
    let deptName;
    inquirer.prompt(question)
    .then(response => {
        deptName = response.addDepart
            connection.query(
                'INSERT INTO departments SET department_name = ?',
                [
                    deptName
                ],
                function(err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + ' added!\n');
                    listQuestions();
                }
            );
    })
};

addToRole = (question) => {
    let deptId;
    let roleName;
    let roleSalary

    inquirer.prompt(question)
    .then(response => {
        roleName = response.name;
        roleSalary = response.salary
        connection.query(
                `SELECT * FROM departments`,
                function(err, results) {
                  if (err) throw err; 
                    for (let i = 0; i < results.length; i++) {
                        if (response.depart === results[i].department_name) {
                            deptId = results[i].id;
                            connection.query(
                                `INSERT INTO roles (title, salary, department_id)
                                VALUES (?,?,?)`,
                                [
                                    roleName,
                                    roleSalary,
                                    deptId
                                ],
                                function(err, res) {
                                    if (err) throw err;
                                    console.log(res.affectedRows + ' added!\n');
                                    listQuestions();
                                }
                            );
                        }
                    }
                }
        );
    });
};

addToEmployee = (question) => {
    let roleId;
    let roleName;
    let managerId;
    let newFirstName;
    let newLastName;
    let managerArr = [];

    inquirer.prompt(question)
    .then(response => {
        newFirstName = response.firstName;
        newLastName = response.lastName;
        managerArr = response.manager.split(' ');
        roleName = response.role;
        connection.query(`SELECT * FROM employees`, function (err, results) {
            if (err) throw err;

            for (let i = 0; i < results.length; i++) {
                if (results[i].first_name === managerArr[0] && results[i].last_name === managerArr[1]) {
                    managerId = parseInt(results[i].id);

                    connection.query(`SELECT * FROM roles`, function(err, results) {
                        if (err) throw err; 
                        for (let i = 0; i < results.length; i++) {
                            if (roleName === results[i].title) {
                                roleId = results[i].id;

                                connection.query(
                                    `INSERT INTO employees (first_name, last_name, role_id,  manager_id)
                                    VALUES (?,?,?,?)`,
                                    [
                                        newFirstName,
                                        newLastName,
                                        roleId,
                                        managerId
                                    ],
                                    function(err, res) {
                                        if (err) throw err;
                                        console.log(res.affectedRows + ' added!\n');
                                        listQuestions();
                                    }
                                );
                            }
                        }    
                    });    
                };
            }
        });
    });
};

// 

updateRoleFunct = (question) => {
    let nameId;
    let roleId;
    inquirer.prompt(question).then((response) => {
      let nameArr = response.name.split(" ");
      let roleName = response.role
        connection.query(`SELECT * FROM employees`, function (err, results) {
            if (err) throw err;
            for (let i = 0; i < results.length; i++) {
                if (results[i].first_name === nameArr[0] && results[i].last_name === nameArr[1]) {
                    nameId = parseInt(results[i].id);
                    connection.query(`SELECT * FROM roles`, function(err, results) {
                        if (err) throw err; 
                        for (let i = 0; i < results.length; i++) {
                            if (roleName === results[i].title) {
                                roleId = results[i].id;
                                connection.query(
                                    `UPDATE employees SET role_id = ? WHERE id = ?`,
                                    [
                                    roleId,
                                    nameId
                                    ],
                                    function (err, res) {
                                    if (err) throw err;
                                    console.log(res.affectedRows + " updated!\n");
                                    listQuestions();
                                    }
                                );
                            } 
                        }  
                    })
                }
            }
        });
    });
};


allRoleNames = () => {
    rolesArr = []
    connection.query(`SELECT * FROM roles`, function(err, results) {
        if (err) throw err; 
        results.forEach(role => {
            rolesArr.push(role.title)
        })
    })
    return rolesArr;

}

module.exports = allRoleNames 