import pyodbc
import random
import string
from faker import Faker

# suite_type, stay_in_hours



def mass_update_resort_reservation(cursor):
    sql = '''
        insert novapark.resort_reservation
        (
            suite_type,
            stay_in_hours
        )
        values
        (?, ?)
    '''

SERVER = 'novapark.database.windows.net'
DATABASE = 'novapark_2023-11-07T21-04Z'
USERNAME = 'admin-08'
PASSWORD = 'password@123'

connectionString = f'DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={SERVER};DATABASE={DATABASE};UID={USERNAME};PWD={PASSWORD}'

def mass_insert_visitor(cursor, n):
    query = '''
        insert into novapark.visitor
        (
            first_name, last_name, ticket_no, phone, is_present,
            age, num_of_visitations, gender, income
        ) values (
                ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    '''
    for _ in range(n):
        first_name = fake.first_name()
        last_name = fake.last_name()
        ticket_no = generate_random_letters(7)
        phone = generate_random_code(10)
        is_present = random.choice([0, 1])
        age = random.randint(9, 82)
        num_of_visitations = random.randint(1, 11)
        gender = random.choice([0, 1])
        income = random.uniform(52081,1554674)

        cursor.execute(query,(first_name,last_name,ticket_no,phone,is_present,age,num_of_visitations,gender,income))

def generate_random_letters(length):
    letters = string.ascii_letters  # Contains 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return ''.join(random.choice(letters) for _ in range(length))

def generate_random_code(length):
    letters = string.digits 
    return ''.join(random.choice(letters) for _ in range(length))


n = 100
fake = Faker()

try:
    conn = pyodbc.connect(connectionString)
    cursor = conn.cursor()

    mass_insert_visitor(cursor, n)

    print(f'Successfully inserted {n} fake records into the database.')
    
    conn.commit()
    cursor.close()
    conn.close()
except pyodbc.Error as e:
    print(f"Error connecting to the database: {e}")