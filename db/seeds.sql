INSERT INTO departments (department_name) VALUES 
    ('Sales'), ('Engineering'), ('HR');

INSERT INTO roles (title, salary, department_id) VALUES 
    ('Sales Lead', '120000', 1), 
    ('Sales Person', '100000', 1), 
    ('Lead Engineer', '100000', 2), 
    ('Junior Engineer', '70000', 2), 
    ('HR Lead', '150000', 3),
    ('HR Specialist', '100000', 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES
    ('Sally', 'Joe', 3, null),
    ('Billy', 'Sue', 3, 1),
    ('John', 'Doe', 1, null),
    ('Jane', 'Dane', 2 , null),
    ('Jill', 'Mill', 1, 3),
    ('James', 'Spade', 2, 4),
    ('Millie', 'Billy', 3, 1);