import {createRoot, Root} from 'react-dom/client';
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	ReactNode,
	ForwardRefExoticComponent
} from 'react';

import dtEvents from './events';

import type DTType from 'datatables.net';
import type {Api as DTApiType, Config as DTConfig} from 'datatables.net';

let DataTablesLib: DTType<any> | null = null;

type SlotCache = Root[];

export type DataTableSlot =
	| ((data: any, row: any) => React.JSX.Element)
	| ((data: any, type: string, row: any) => any)
	| ((data: any, type: string, row: any, meta: object) => any);

export type DataTableSlots = {
	[key: string | number]: DataTableSlot;
};

export interface DataTableProps {
	/** DataTables Ajax configuration */
	ajax?: DTConfig['ajax'];

	/** Table header */
	children?: ReactNode | undefined;

	/** Class to assign to the `<table>` */
	className?: string;

	/** DataTables column configuration */
	columns?: DTConfig['columns'];

	/** Data to populate the DataTable */
	data?: any[];

	/** ID to assign to the `<table>` */
	id?: string;

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

export interface DataTableRef {
	/**
	 * Get the DataTables API instance from the component. Can be `null` if not
	 * yet rendered.
	 *
	 * @returns DataTables API instance
	 */
	dt: () => DTApiType | null;
}

/**
 * DataTables.net component for React.
 * 
 * Typically a child will be given to the component to define the table header,
 * although this is option if you use the `columns.title` option of DataTables
 * to define the columns and their titles.
 * 
 * See https://datatables.net/manual/react for details on how to use this
 * component.
 */
export interface DataTableComponent
	extends ForwardRefExoticComponent<DataTableProps & React.RefAttributes<DataTableRef>> {
	/**
	 * Set the DataTables library to use for this component (e.g. the result from
	 * `import DT from 'datatables.net-dt'` or `import DT from 'datatables.net-bs5'`).
	 *
	 * @param dtLib DataTables core library
	 * @returns
	 */
	use: (dtLib: DTType<any>) => void;
}

// any here, so we can assign the `use` later - it is really a DataTableComponent though
const Component: any = forwardRef<DataTableRef, DataTableProps>(function DataTable(props, ref) {
	const tableEl = useRef<HTMLTableElement | null>(null);
	const table = useRef<DTApiType<any> | null>(null);
	const options = useRef(props.options ?? {});
	const cache = useRef<SlotCache>([]);

	// Expose the DataTables API via a reference
	useImperativeHandle(ref, () => ({
		dt: () => table.current
	}));

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
		applySlots(cache.current, options.current, props.slots);
	}

	// Create the DataTable when the `<table>` is ready in the document
	useEffect(() => {
		if (!DataTablesLib) {
			throw new Error(
				'DataTables library not set. See https://datatables.net/tn/23 for details.'
			);
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

		// Unmount tidy up
		return () => {
			if (table.current) {
				// Unmount the created roots when this component unmounts
				let roots = cache.current.slice();
				cache.current.length = 0;

				setTimeout(() => {
					roots.forEach((r) => {
						r.unmount();
					});
				}, 250);

				table.current.destroy();
				table.current = null;
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
			<table ref={tableEl} className={props.className ?? ''} id={props.id ?? ''}>
				{props.children ?? null}
			</table>
		</div>
	);
});

Component.use = function (lib: DTType<any>) {
	DataTablesLib = lib;
};

const Exporter: DataTableComponent = Component;

export default Exporter;

/**
 * Loop over the slots defined and apply them to their columns,
 * targeting based on the slot name (object key).
 *
 * @param options DataTables configuration object
 * @param slots Props passed in
 */
function applySlots(cache: SlotCache, options: DTConfig, slots: DataTableSlots) {
	if (!options.columnDefs) {
		options.columnDefs = [];
	}

	Object.keys(slots).forEach((name) => {
		let slot = slots[name];

		if (!slot) {
			return;
		}

		// Simple column index
		if (name.match(/^-?\d+$/)) {
			// Note that unshift is used to make sure that this property is
			// applied in DataTables _after_ the end user's own options, if
			// they've provided any.
			options.columnDefs!.unshift({
				target: parseInt(name),
				render: slotRenderer(cache, slot)
			});
		}
		else {
			// Column name
			options.columnDefs!.unshift({
				target: name + ':name',
				render: slotRenderer(cache, slot)
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
function slotRenderer(cache: SlotCache, slot: DataTableSlot) {
	return function (data: any, type: string, row: any, meta: object) {
	        if (slot.length === 4) {
			let result = slot(data, type, row, meta);
			
			return result['$$typeof'] ? renderJsx(cache, result) : result;
		} else if (slot.length === 3) {
			// The function takes three parameters so it allows for
			// orthogonal data - not possible to cache the response
			let result = slot(data, type, row, meta);

			return result['$$typeof'] ? renderJsx(cache, result) : result;
		}

		// Otherwise, we are expecting a JSX return from the function every
		// time and we can cache it. Note the `slot as any` - Typescript
		// doesn't appear to like the two argument option for `DataTableSlot`.
		return slotCache(cache, () => (slot as any)(data, row));
	};
}

/**
 * Render a slot's element and cache it
 */
function slotCache(cache: SlotCache, create: Function) {
	// Execute the rendering function
	let result = create();

	// If the result is a JSX element, we need to render and then cache it
	if (result['$$typeof']) {
		let div = renderJsx(cache, result);

		return div;
	}

	// Any other data just gets returned
	return result;
}

/**
 * Render JSX into a div which can be shown in a cell
 */
function renderJsx(cache: SlotCache, jsx: React.JSX.Element): HTMLDivElement {
	let div = document.createElement('div');
	let root = createRoot(div);

	root.render(jsx);
	cache.push(root);

	return div;
}
