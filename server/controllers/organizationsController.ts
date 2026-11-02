import { createCrudController } from './crudController';

export const organizationsController = createCrudController({
  tableName: 'organizations',
  defaultSortColumn: 'name',
  defaultSortAscending: true,
});
