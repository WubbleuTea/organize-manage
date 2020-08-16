const inquirer = require('inquirer')
const mysql = require('mysql2');
const cTable = require('console.table')
const figlet = require('figlet');
require('dotenv').config();


const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME
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

// function for asking the initial question
listQuestions = () => {
    // 
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
                "Update and Employee's Manager",
                'View Employees by Manager',
                'View Employees by Department',
                'Quit']
        }
    ])
    // use the answer choice to continue through the application
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
                break;
            case "Update and Employee's Manager":
                updateEmployeeManager();
                break;
            case 'View Employees by Manager':
                viewEmployeesByManager();
                break;
            case 'View Employees by Department':
                viewEmployeesByDepartment();
                break;
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
    // joining departments table to roles
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
    // Add department to the table
    .then(response => {
            connection.query(
                'INSERT INTO departments SET department_name = ?',
                [
                    response.addDepart
                ],
                function(err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + ' added!\n');
                     // Return back to the original set of questions.
                    listQuestions();
                }
            );
    })
};

// Add an role to the database
async function addToRole() {
    let deptId;
    // array created for the answer choices
    let departments = await allDepartments();

     // Asks the question for what they want to add
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
        let { name, salary, depart } = response
        connection.query(
            // query to find the manager using the array that was made
            `SELECT id FROM departments where department_name = ?`,
            [ depart ], function(err, results) {
                if (err) throw err;
                // set the departmentID for use in the next connection
                deptId = results[0].id;
                // Add the new role to the table using the responses and the found id
                connection.query(
                    `INSERT INTO roles (title, salary, department_id)
                    VALUES (?,?,?)`,
                    [
                        name,
                        salary,
                        deptId
                    ],
                    function(err, res) {
                        if (err) throw err;
                        console.log(res.affectedRows + ' added!\n');
                        // Return back to the original set of questions.
                        listQuestions();
                    }
                );
            }
        );
    });
};

// Add an employee to the database
async function addToEmployee() {
    let roleId;
    let managerId;
    // arrays created for the answer choices
    let employees = await allEmployees();
    let roles = await allRoleNames();

    // Asks the question for what they want to add
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
        // destructure response
        const { firstName, lastName, role, manager } = response
        // if they answer none make the manager id null
        if (manager == 'None') {
            managerId = null;
        //else take the manager name selected and find the id
        } else {
            //make a manager array to hold the first and last name and split the answered name into an array
            let managerArr = [];
            managerArr = manager.split(' ');
            // query to find the manager using the array that was made
            connection.query(`SELECT id FROM employees WHERE first_name = ? AND last_name = ?`,
                [managerArr[0], managerArr[1]], function (err, results) {  
                if (err) throw err;
                // set the managerId to that found number to use later.
                managerId = results[0].id;
            })
        }    
        /// Query that takes the title name and finds the id where it matches
        connection.query(`SELECT id FROM roles WHERE title = ?`,
            [ role ], function(err, results) {
            if (err) throw err; 
            // set the roleId to use in the next connection
            roleId = results[0].id;
                //Insert Query for the table using the response firstName and LastName, and the two set variables.
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
                        // Return back to the original set of questions.
                        listQuestions();
                    }
                );
            }
        );    
    });
};

// Updates an employees roles
async function updateRoleFunct()  {
    let nameId;
    let roleId;
    // arrays created for the answer choices
    let employees = await allEmployees();
    let roles = await allRoleNames();


    // Asks the question of what to change
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
            choices: roles, 
            when: function(answers) {
               return (answers.name === 'None') ? false : true; 
            }
        }
        //find the id of the person that has been requested to update
    ]).then(response => {
        if (response.name === 'None') {
            console.log('No employee updated')
            listQuestions();
        } else {
            // split the name into an array us it for MySQL
            let nameArr = response.name.split(" ");
            // find the emplyee in the table
            connection.query(`SELECT id FROM employees WHERE first_name = ? AND last_name = ?`,
                [ nameArr[0], nameArr[1] ], function (err, results) {
                    if (err) throw err;
                    // set the nameID to use in the actual UPDATE
                    nameId = results[0].id;            
                        // Query that takes the title name and finds the id where it matches
                    connection.query(`SELECT id FROM roles WHERE title = ?`,
                        [ response.role ], function(err, results) {
                            if (err) throw err; 
                            // set the roleId to use in the next connection
                            roleId = results[0].id;
                            // update the employee role at the specific employee id
                                connection.query(
                                    `UPDATE employees SET role_id = ? WHERE id = ?`,
                                    [
                                        roleId,
                                        nameId
                                    ],
                                    function (err, res) {
                                        if (err) throw err;
                                        console.log(res.affectedRows + " updated!\n");
                                        // Return back to the original set of questions.
                                        listQuestions();
                                    }
                                );
                        } 
                    );
                }
            );
        };
    });
};


async function updateEmployeeManager() {
    let nameId;
    let managerId;
    // arrays created for the answer choices
    let employees = await allEmployees();

    // Asks the question of what to change
    inquirer.prompt([
        {
            type: 'list',
            name: 'name',
            message: 'Please enter the name of the employee you would like to change.',
            choices: employees
        },
        {
            type: 'list',
            name: 'manager',
            message: 'Please choose the new manager for the employee.',
            choices: employees, 
            when: function(answers) {
                return (answers.name === 'None') ? false : true; 
            }
        }
        //find the id of the person that has been requested to update
    ]).then(response => {
        let { name, manager } = response;
        if (name === 'None') {
            console.log('No employee updated')
        } else {
            // split the name into an array us it for MySQL
            let nameArr = name.split(" ");
            // find the emplyee in the table
            connection.query(`SELECT id FROM employees WHERE first_name = ? AND last_name = ?`,
                [ nameArr[0], nameArr[1] ], function (err, results) {
                    if (err) throw err 
                    // set the nameID to use in the actual UPDATE
                    nameId = results[0].id;
                    if (manager === 'None' || manager === name) {
                        managerId = null;
                        updateManager(managerId, nameId)
                    //else take the manager name selected and find the id
                    } else {
                        //make a manager array to hold the first and last name and split the answered name into an array
                        let managerArr = manager.split(' ');
                        console.log('this is the manager arr first ' + managerArr[0])
                        // query to find the manager using the array that was made
                        connection.query(`SELECT id FROM employees WHERE first_name = ? AND last_name = ?`,
                            [managerArr[0], managerArr[1]], function (err, results) {  
                            if (err) throw err;
                            // set the managerId to that found number to use later.
                            managerId = results[0].id;
                            console.log("this is the manager ID" + managerId)
                            updateManager(managerId, nameId)
                        })
                    }
                }
            )  
        }    
    })
};

async function viewEmployeesByManager() {
    let managerId;
    // arrays created for the answer choices
    let employees = await allEmployees();

    // Asks the question of what to change
    inquirer.prompt([
        {
            type: 'list',
            name: 'manager',
            message: 'Please choose the manager to view their employees.',
            choices: employees, 
        }
        //find the id of the person that has been requested to update
    ]).then(response => {
        let { manager } = response;
        if (manager === 'None') {
            console.log('No Manager picked')
            listQuestions();
        } else {
            //make a manager array to hold the first and last name and split the answered name into an array
            let managerArr = manager.split(' ');
            // query to find the manager using the array that was made
            connection.query(`SELECT id FROM employees WHERE first_name = ? AND last_name = ?`,
                [managerArr[0], managerArr[1]], function (err, results) {  
                if (err) throw err;
                // set the managerId to that found number to use later.
                managerId = results[0].id;
                console.log(`\n========${manager}========\n`)
                connection.query(`SELECT id, first_name, last_name FROM employees WHERE manager_id = ? ORDER by id DESC`,
                    [managerId], function (err, results) {  
                        if (err) throw err;
                        console.table(results); 
                        listQuestions();
                    }
                )    
            })
        }
    })
};

function viewEmployeesByDepartment() {
    let departId;
    // arrays created for the answer choices
    let departments = await allDepartments();

    // Asks the question of what to change
    inquirer.prompt([
        {
            type: 'list',
            name: 'depart',
            message: 'What is the name of the department for this role?',
            choices: departments
        }
        //find the id of the person that has been requested to update
    ]).then(response => {
        let { depart } = response;
        // query to find the manager using the array that was made
        connection.query(`SELECT id FROM departments WHERE department_name = ?`,
            [ depart ], function (err, results) {  
            if (err) throw err;
            // set the managerId to that found number to use later.
            departId = results[0].id;
            console.log(`\n========${depart}========\n`)
            connection.query(`SELECT id, first_name, last_name, FROM employees WHERE department_id = ? ORDER by id DESC`,
                [departId], function (err, results) {  
                    if (err) throw err;
                    console.table(results); 
                    listQuestions();
                }
            )    
        })
    })
}

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
        employeeArr = ['None']
        connection.query(`SELECT * FROM employees`, function(err, results) {
            if (err) reject(err); 
            results.forEach(employee => {
                employeeArr.push(`${employee.first_name} ${employee.last_name}`)
            })
            resolve(employeeArr);
        })
    });
};

async function allDepartments() {
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

function updateManager(managerId, nameId) {
    connection.query(
        `UPDATE employees SET manager_id = ? WHERE id = ?`,
        [
            managerId,
            nameId
        ],
        function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " updated!\n");
            console.log(managerId, nameId)
            // Return back to the original set of questions.
            listQuestions();
        }
    )  
}
