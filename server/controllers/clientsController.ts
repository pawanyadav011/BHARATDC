import { createCrudController } from './crudController';

export const clientsController = createCrudController({
  tableName: 'clients',
  defaultSortColumn: 'name',
  defaultSortAscending: true,
});
