// ===========================================================================
// server/config/seeds.js
// This is a SEED SCRIPT. You run it manually (not part of the normal server)
// to fill the database with fake test data. It wipes out all existing users
// and inserts a handful of randomly-generated fake users so you have something
// to work with while developing. It exits when it's done.
// ===========================================================================

const db = require('./connection');      // The database connection (so we can wait for it to open)
const { User } = require('../models');   // The User model, used to delete/create users in the DB
const faker = require('faker');          // "faker": library that generates fake names, emails, passwords, etc.

// Wait for the database connection to be ready, then run the seeding logic.
// The callback is "async" so we can use "await" for the database operations.
db.once('open', async () => {
    await User.deleteMany(); // Delete ALL existing users first (start with a clean slate)

    const users = []; // We'll build up an array of fake user objects here

    // Loop 4 times to create 4 fake users.
    for (let i = 0; i < 4; i++) {
        users.push({
            firstName: faker.name.firstName(),      // random first name
            lastName: faker.name.lastName(),        // random last name
            username: faker.internet.userName(),    // random username
            email: faker.internet.email(),          // random email address
            password: faker.internet.password(),    // random password (will be hashed by the User model)
            medList: []                             // start each user with an empty medication list
        });
    }

    await User.create(users); // Insert all the fake users into the database at once

    console.log(`Seeded ${users.length} users`); // Log how many users were created
    process.exit(); // Stop the script (this is a one-off task, not a long-running server)
});
