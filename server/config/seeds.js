const db = require('./connection');
const { User } = require('../models');
const faker = require('faker');

db.once('open', async () => {
    await User.deleteMany();

    const users = [];
    for (let i = 0; i < 4; i++) {
        users.push({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            medList: []
        });
    }

    await User.create(users);

    console.log(`Seeded ${users.length} users`);
    process.exit();
});
