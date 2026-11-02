import { createCrudController } from './crudController';

export const dataCentersController = createCrudController({
  tableName: 'data_centers',
  defaultSortColumn: 'name',
  defaultSortAscending: true,
});
