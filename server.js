const inquirer = require('inquirer')
const mysql = require('mysql2');
const cTable = require('console.table')
const figlet = require('figlet');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'f1oK69w%C#MsaVyzJx$',
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
    figlet('Employee Database', function(err, data) {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(data)
        listQuestions();
    });
};
// list of questions are asked
listQuestions = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'firstQuestion',
            message: 'What would you like to do?',
            choices: [
                'View All Departments', 
                'View All Roles', 
                'View All Employees', 
                'Add a Department', 
                'Add a Role', 
                'Add an Employee', 
                'Update an Employee Role', 
                'Quit']
        }
    ])
    .then(answer => {
        let choice = answer.firstQuestion
        if (choice === 'View All Departments') {
            viewAllDept();
        } else if (choice === 'View All Roles') {
            viewAllRoles();
        } else if (choice === 'View All Employees') {
            viewAllEmployees();
        } else if (choice === 'Add a Department') {
            addToDept();
        } else if (choice === 'Add a Role') {
            addToRole();
        } else if (choice === 'Add an Employee') {
            addToEmployee();
        } else if (choice === 'Update an Employee Role') {
            updateRoleFunct();
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

addToDept = () => {
    let deptName;
    inquirer.prompt([
        {
            type: 'input',
            name: 'addDepart',
            message: 'What is the name of the department you would like to add?',
            validate: addDepartInput => {
                if (addDepartInput) {
                    return true;
                } else {
                    console.log('Please enter your new department!');
                    return false;
                }
            }
        }
    ])
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

addToRole = () => {
    let deptId;
    let roleName;
    let roleSalary

    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Please enter the name of the new role.',
            validate: roleNameInput => {
                if (roleNameInput) {
                    return true;
                } else {
                    console.log('Please enter name of this role!');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary of this role?',
            validate: roleSalaryInput => {
                if (roleSalaryInput) {
                    return true;
                } else {
                    console.log('Please enter salary of this role!');
                    return false;
                }
            }
        },
        {
            type: 'list',
            name: 'depart',
            message: 'What is the name of the department for this role?',
            choices: allDepartments()
        }
    ])
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

addToEmployee = () => {
    let roleId;
    let roleName;
    let managerId;
    let newFirstName;
    let newLastName;
    let managerArr = [];

    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'Please enter the first name of this employee.',
            validate: firstNameInput => {
                if (firstNameInput) {
                    return true;
                } else {
                    console.log("Please enter the employee's first name!");
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Please enter the last name of this employee.',
            validate: lastNameInput => {
                if (lastNameInput) {
                    return true;
                } else {
                    console.log("Please enter the employee's last name!");
                    return false;
                }
            }
        },
        {
            type: 'list',
            name: 'role',
            message: 'Please enter the role of this employee.',
            choices: allRoleNames()
        },
        {
            type: 'list',
            name: 'manager',
            message: 'Please enter the manager of this employee.',
            choices: allEmployees()
        }
    ])
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

updateRoleFunct = () => {
    let nameId;
    let roleId;
    inquirer.prompt([
        {
            type: 'input',
            name: 'comments',
            message: 'Please add any comments about this role change:'
        },
        {
            type: 'list',
            name: 'name',
            message: 'Please enter the name of the employee you would like to change.',
            choices: allEmployees()
        },
        {
            type: 'list',
            name: 'role',
            message: 'Please enter the new role of this employee.',
            choices: allRoleNames()
        }
    ]).then(response => {
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


function allRoleNames() {
    rolesArr = []
    connection.query(`SELECT * FROM roles`, function(err, results) {
        if (err) throw err; 
        results.forEach(role => {
            rolesArr.push(role.title)
        })
    })
    return rolesArr;

}

function allEmployees() {
    employeeArr = []
    connection.query(`SELECT * FROM employees`, function(err, results) {
        if (err) throw err; 
        results.forEach(employee => {
            employeeArr.push(`${employee.first_name} ${employee.last_name}`)
        })
    })
    return employeeArr;

}

function allDepartments() {
    deptArr = []
    connection.query(`SELECT * FROM departments`, function(err, results) {
        if (err) throw err; 
        results.forEach(dept => {
            deptArr.push(dept.department_name)
        })
    })
    return deptArr;

}

module.exports = allRoleNames 