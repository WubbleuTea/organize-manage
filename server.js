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
        switch (answer.firstQuestion) {
            case 'View All Departments':
                viewAllDept();
                break;
            case 'View All Roles':
                viewAllRoles();
                break
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'Add a Department':
                addToDept();
                break;
            case 'Add a Role':
                addToRole();
                break;
            case 'Add an Employee':
                addToEmployee();
                break;
            case 'Update an Employee Role':
                updateRoleFunct();
            default:
                connection.end();
        }
    });
};

// View all departments
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

// View all roles
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

// View All Employees
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

// adding a department to the table
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
    // store input as the new department name in the table
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

// add a new role
async function addToRole() {
    let deptId;
    let departments = await allDepartments()
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
            choices: departments
        }
    ])
    .then(response => {
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
                                    response.name,
                                    response.salary,
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

async function addToEmployee() {
    let roleId;
    let managerId;
    let managerArr = [];
    let employees = await allEmployees()
    let roles = await allRoleNames()

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
            choices: roles
        },
        {
            type: 'list',
            name: 'manager',
            message: 'Please enter the manager of this employee.',
            choices: employees
        }
    ])
    .then(response => {
        const { firstName, lastName, role, manager } = response
        managerArr = manager.split(' ');
        // query to find the manager
        connection.query(`SELECT id FROM employees WHERE first_name = ? AND last_name = ?`,
            [managerArr[0], managerArr[1]], function (err, results) {  
            if (err) throw err;
            managerId = results[0].id;
                    // Query to find the role id
                    connection.query(`SELECT id FROM roles WHERE title = ?`,
                        [ role ], function(err, results) {
                            if (err) throw err; 
                            roleId = results[0].id;
                                //Insert Query for the table.
                                connection.query(
                                    `INSERT INTO employees (first_name, last_name, role_id,  manager_id)
                                    VALUES (?,?,?,?)`,
                                    [
                                        firstName,
                                        lastName,
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
                    );    
            }
        );
    });
};

// 

async function updateRoleFunct()  {
    let nameId;
    let roleId;
    let employees = await allEmployees()
    let roles = await allRoleNames()
    
    inquirer.prompt([
        {
            type: 'list',
            name: 'name',
            message: 'Please enter the name of the employee you would like to change.',
            choices: employees
        },
        {
            type: 'list',
            name: 'role',
            message: 'Please enter the new role of this employee.',
            choices: roles
        }
    ]).then(response => {
      let nameArr = response.name.split(" ");
        connection.query(`SELECT id FROM employees WHERE first_name = ? AND last_name = ?`,
            [nameArr[0], nameArr[1]], function (err, results) {
                if (err) throw err;
                nameId = results[0].id;            
                    connection.query(`SELECT id FROM roles WHERE title = ?`,
                        [ response.role ], function(err, results) {
                            if (err) throw err; 
                            roleId = results[0].id;
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
                    );
            }
        );
    });
};


async function allRoleNames() {
    return new Promise(function (resolve, reject) {
        rolesArr = []
        connection.query(`SELECT * FROM roles`, function(err, results) {
            if (err) reject(err); 
            results.forEach(role => {
                rolesArr.push(role.title)
            })
            resolve(rolesArr)
        })
    })
}

async function allEmployees() {
    return new Promise(function (resolve, reject) {
        employeeArr = []
        connection.query(`SELECT * FROM employees`, function(err, results) {
            if (err) reject(err); 
            results.forEach(employee => {
                employeeArr.push(`${employee.first_name} ${employee.last_name}`)
            })
            resolve(employeeArr);
        })
    });
};

function allDepartments() {
    return new Promise(function (resolve, reject) {
        deptArr = []
        connection.query(`SELECT * FROM departments`, function(err, results) {
            if (err) reject(err); 
            results.forEach(dept => {
                deptArr.push(dept.department_name)
            })
            resolve(deptArr);
        })
    });
};