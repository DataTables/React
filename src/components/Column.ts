import type { ColumnData, ColumnOptions } from 'datatables.net';
import React from 'react';

export interface ColumnProps {
	/**
	 * JSX or render function for cell content in this column. Can be static JSX
	 * or a function receiving (data, type, row, meta).
	 */
	children?:
		| React.ReactNode
		| ((data: any, type: string, row: any, meta: any) => React.ReactNode);

	/**
	 * Data point property - points at the name, index of the data point to use
	 * for the row. Can also be a function that will resolve to the value to
	 * display, or `null` to give the whole row.
	 */
	data?: ColumnData;

	/** Column footer text (can be an empty string to generate an empty cell) */
	footer?: string;

	/**
	 * Additional DataTables column options (width, className, visible, etc.)
	 */
	options?: ColumnOptions;

	/**
	 * Define a rendering function to display the data. Note that you can't use
	 * a child node and a renderer at the same time. The child node will take
	 * priority. If you need formatting when using child nodes, please perform
	 * the formatting in the function.
	 */
	render?: ColumnOptions['render'];

	/** Column header title */
	title?: string;
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
