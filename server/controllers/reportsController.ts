import { createCrudController } from './crudController';

export const reportsController = createCrudController({
  tableName: 'reports',
  defaultSortColumn: 'generated_date',
  defaultSortAscending: false,
});
