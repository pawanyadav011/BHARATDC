import { createCrudController } from './crudController';

export const racksController = createCrudController({
  tableName: 'racks',
  defaultSortColumn: 'rack_number',
  defaultSortAscending: true,
});
