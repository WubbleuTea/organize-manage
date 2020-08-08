const openingQuestion = [
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
            'quit']
    }
];

const addDept = [
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
];

const addRole = [
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
        type: 'input',
        name: 'depart',
        message: 'What is the name of the department for this role?',
        validate: departInput => {
            if (departInput) {
                return true;
            } else {
                console.log('Please enter the department for this role!');
                return false;
            }
        }
    }
];

const addEmployee = [
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
        choices: ['first', 'second', 'third', 'fourth']
    },
    {
        type: 'list',
        name: 'manager',
        message: 'Please enter the manager of this employee.',
        choices: ['first', 'second', 'third', 'fourth']
    }
];

const updateRole = [
    {
        type: 'list',
        name: 'role',
        message: 'Please select the new role of this employee.',
        choices: ['first', 'second', 'third', 'fourth']
    },
];

module.exports = { openingQuestion, addDept, addRole, addEmployee, updateRole }