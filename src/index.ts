import Column, { type ColumnProps } from './components/Column';
import DataTable from './components/DataTable';

DataTable.Column = Column;

export default DataTable;
export * from './components/DataTable';

export { Column, ColumnProps };
