
exports.up = function(knex) {
    return knex.schema.createTable("stock", table => {
        table.increments()
        table.string("symbol")
        table.integer("high")
        table.integer("low")
        table.string("company_name")
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("stock")
};
