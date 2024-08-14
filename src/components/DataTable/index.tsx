import {useEffect, useRef, PropsWithChildren} from 'react';
import {createRoot} from 'react-dom/client';

import dtEvents from './events';

import type DTType from 'datatables.net';
import type {
	Api as DTApiType,
	Config as DTConfig
} from 'datatables.net';

let DataTablesLib: DTType<any> | null = null;

export type DataTableSlot = 
	((data: any, row: any) => React.JSX.Element) |
	((data: any, type: string, row: any) => any);

export type DataTableSlots = {
	[key: string | number]: DataTableSlot
};

export interface DataTableProps {
	/** DataTables Ajax configuration */
	ajax?: DTConfig['ajax'];

	/** Class to assign to the `<table>` */
	className?: string;

	/** DataTables column configuration */
	columns?: DTConfig['columns'];

	/** Data to populate the DataTable */
	data?: any[];

	/**
	 * DataTables configuration object.
	 * 
	 * The properties `ajax`, `columns` and `data` will be merged into this
	 * object. They can be provided using their individual properties, or
	 * via this object. The individual properties take priority.
	 */
	options?: DTConfig;

	/**
	 * Rendering slot function to use in a column. The key denotes where the
	 * slot will be rendered - as an integer that is the column index, while
	 * as a string it is the column's name (from `columns.name`). Each slot
	 * is a function that takes two parameters and returns the element to
	 * render.
	 */
	slots?: DataTableSlots;

	/**
	 * Event listeners. Please refer to the DT docs for details on the event
	 * listeners available. The names are camelCase here.
	 */
	[key: `on${string}`]: Function;
}

export default function DataTable(props: PropsWithChildren<DataTableProps>) {
	const tableEl = useRef<HTMLTableElement | null>(null);
	const table = useRef<DTApiType<any> | null>(null);
	const options = useRef(props.options ?? {});

	// Expose some of the more common settings as props
	if (props.data) {
		options.current.data = props.data;
	}

	if (props.ajax) {
		options.current.ajax = props.ajax;
	}

	if (props.columns) {
		options.current.columns = props.columns;
	}

	// If slots are defined, create `columnDefs` entries for them to apply
	// to their target columns.
	if (props.slots) {
		applySlots(options.current, props.slots);
	}

	// Create the DataTable when the `<table>` is ready in the document
	useEffect(() => {
		if (!DataTablesLib) {
			throw new Error('DataTables library not set. See https://datatables.net/tn/23 for details.');
		}

		if (tableEl.current) {
			const $ = DataTablesLib.use('jq') as unknown as JQueryStatic;
			const table$ = $(tableEl.current);

			// Bind to DataTable's events so they can be listened to with an `on` property
			dtEvents.forEach((name) => {
				// Create the `on*` name from the DataTables event name, which is camelCase
				// and an `on` prefix.
				const onName =
					'on' +
					name[0]!.toUpperCase() +
					name.slice(1).replace(/-[a-z]/g, (match) => match[1]!.toUpperCase());

				if ((props as any)[onName]) {
					table$.on(name + '.dt', (props as any)[onName]);
				}
			});

			// Initialise the DataTable
			table.current = new DataTablesLib(tableEl.current, options.current);
		}

		// Tidy up
		return () => {
			if (table.current) {
				table.current.destroy();
			}
		};
	}, []);

	// On data change, clear and redraw
	useEffect(() => {
		if (props.data) {
			if (table.current) {
				table.current.clear();
				table.current.rows.add(props.data).draw(false);
			}
		}
	}, [props.data]);

	return (
		<div>
			<table ref={tableEl} className={props.className ?? ''}>
				{props.children ?? ''}
			</table>
		</div>
	);
}

/**
 * Set the DataTables library to use for this component
 *
 * @param lib The DataTables core library
 */
DataTable.use = function (lib: DTType<any>) {
	DataTablesLib = lib;
};

/**
 * Loop over the slots defined and apply them to their columns,
 * targeting based on the slot name (object key).
 *
 * @param options DataTables configuration object
 * @param slots Props passed in
 */
function applySlots(options: DTConfig, slots: DataTableSlots) {
	if (! options.columnDefs) {
		options.columnDefs = [];
	}

	Object.keys(slots).forEach(name => {
		let slot = slots[name];

		if (! slot) {
			return;
		}

		// Simple column index
		if (name.match(/^\d+$/)) {
			// Note that unshift is used to make sure that this property is
			// applied in DataTables _after_ the end user's own options, if
			// they've provided any.
			options.columnDefs!.unshift({
				target: parseInt(name),
				render: slotRenderer(slot)
			});
		}
		else {
			// Column name
			options.columnDefs!.unshift({
				target: name + ':name',
				render: slotRenderer(slot)
			});
		}
	});
}

/**
 * Create a rendering function that will create a React component
 * for a cell's rendering function.
 *
 * @param slot Function to create react component or orthogonal data
 * @returns Rendering function
 */
function slotRenderer(slot: DataTableSlot) {
	return function (data: any, type: string, row: any) {
		if (slot.length === 3) {
			// The function takes three parameters so it allows for
			// orthogonal data - not possible to cache the response
			let result = slot(data, type, row);

			return result['$$typeof']
				? renderJsx(result)
				: result;
		}

		// Otherwise, we are expecting a JSX return from the function every
		// time and we can cache it. Note the `slot as any` - Typescript
		// doesn't appear to like the two argument option for `DataTableSlot`.
		return slotCache(() => (slot as any)(data, row));
	};
}

/**
 * Render a slot's element and cache it
 */
function slotCache(create: Function) {
	// Execute the rendering function
	let result = create();

	// If the result is a JSX element, we need to render and then cache it
	if (result['$$typeof']) {
		let div = renderJsx(result);

		return div;
	}

	// Any other data just gets returned
	return result;
}

/**
 * Render JSX into a div which can be shown in a cell
 */
function renderJsx(jsx: React.JSX.Element): HTMLDivElement {
	let div = document.createElement('div');
	let root = createRoot(div);

	root.render(jsx);

	return div;
}
