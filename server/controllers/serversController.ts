import { createCrudController } from './crudController';

export const serversController = createCrudController({
  tableName: 'servers',
  defaultSortColumn: 'hostname',
  defaultSortAscending: true,
});
