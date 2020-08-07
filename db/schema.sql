DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS employees;

CREATE TABLE departments (
    id INTEGER PRIMARY KEY NOT NULL,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE roles (
    id INTEGER PRIMARY KEY NOT NULL
    title VARCHAR(30) NOT NULL,
    salary DECIMAL() NOT NULL,
    FOREIGN KEY (department_id)
        REFERENCES department(id)
);

CREATE TABLE employees (
    id INTEGER PRIMARY KEY NOT NULL,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    FOREIGN KEY (role_id)
        REFERENCES role(id),
    manager_id INTEGER
);