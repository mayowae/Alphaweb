const { Sequelize } = require('sequelize');

const databaseUrl = 'postgresql://alphadb_y2ju_user:QIF5SdOrVTKCE215FgParoJNBjKjgNCd@dpg-d5chbk95pdvs73cd5qo0-a.virginia-postgres.render.com/alphadb_y2ju';

console.log('Testing connection to VIRGINIA DB...');

const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

sequelize.authenticate()
    .then(() => {
        console.log('VIRGINIA DB Connection established successfully.');
        process.exit(0);
    })
    .catch(err => {
        console.error('VIRGINIA DB Connection error:', err);
        process.exit(1);
    });
