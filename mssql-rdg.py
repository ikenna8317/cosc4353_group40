import pyodbc

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

conn = pyodbc.connect(connectionString)

cursor = conn.cursor()

cursor.close()
conn.close()