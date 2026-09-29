import type { ColumnData, ColumnOptions } from 'datatables.net';
import React from 'react';

export interface ColumnProps {
	/** Column header title */
	title?: string;

	/**
	 * Data point property - points at the name, index of the data point to use
	 * for the row. Can also be a function that will resolve to the value to
	 * display, or `null` to give the whole row.
	 */
	data?: ColumnData;

	/**
	 * Additional DataTables column options (width, className, visible, etc.)
	 */
	options?: ColumnOptions;

	/**
	 * JSX or render function for cell content in this column. Can be static JSX
	 * or a function receiving (data, type, row, meta).
	 */
	children?:
		| React.ReactNode
		| ((data: any, type: string, row: any, meta: any) => React.ReactNode);
}

/**
 * Column definition for DataTables.
 *
 * This component is to be used as a child of `<DataTable>`.
 */
export default function Column(_props: ColumnProps): React.ReactElement | null {
	// Marker component inspected by <DataTable>
	return null;
}
