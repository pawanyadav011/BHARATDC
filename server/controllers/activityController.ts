import { createCrudController } from './crudController';

export const activityController = createCrudController({
  tableName: 'activity_logs',
  defaultSortColumn: 'timestamp',
  defaultSortAscending: false,
  transformOut: (log: any) => ({
    ...log,
    userName: log.userName || log.user || 'System',
    user: log.user || log.userName || 'System',
  }),
});
