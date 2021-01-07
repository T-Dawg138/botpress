import { Table } from 'core/database/interfaces'

export class MessagesTable extends Table {
  readonly name: string = 'messages'

  async bootstrap() {
    let created = false

    await this.knex.createTableIfNotExists(this.name, table => {
      table.increments('id').primary()
      table
        .integer('conversationId')
        .unsigned()
        .references('id')
        .inTable('conversations')
        .notNullable()
        .onDelete('cascade')
      table.string('eventId') // .references('id').inTable('events')
      table.timestamp('sentOn')
      table.jsonb('payload')
      table.index(['conversationId', 'sentOn'], 'mcs_idx')
      created = true
    })
    return created
  }
}