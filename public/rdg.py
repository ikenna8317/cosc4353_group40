import mysql.connector
import random
import faker

# Connect to the MySQL database
db = mysql.connector.connect(
    host="your_host",
    user="your_user",
    password="your_password",
    database="your_database"
)

cursor = db.cursor()

# Use the Faker library to generate random data
fake = faker.Faker()

# Example: Populate a "users" table with random names and emails
for i in range(100):  # Insert 100 random records
    name = fake.name()
    email = fake.email()

    # SQL statement to insert random data
    sql = "INSERT INTO users (name, email) VALUES (%s, %s)"
    values = (name, email)

    cursor.execute(sql, values)

db.commit()

# Close the database connection
cursor.close()
db.close()
