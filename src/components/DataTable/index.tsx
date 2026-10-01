import React, {
	ReactNode,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState
} from 'react';
import { createPortal } from 'react-dom';

import Column, { ColumnProps } from '../Column';
import dtEvents from './events';

import type DTType from 'datatables.net';
import type {
	ColumnOptions,
	Api as DTApiType,
	Options as DTConfig
} from 'datatables.net';

let DataTablesLib: DTType | null = null;

type SlotCache = Map<HTMLDivElement, React.ReactPortal>;

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
	extends React.ForwardRefExoticComponent<
		DataTableProps & React.RefAttributes<DataTableRef>
	> {
	/**
	 * Set the DataTables library to use for this component (e.g. the result
	 * from `import DT from 'datatables.net-dt'` or `import DT from
	 * 'datatables.net-bs5'`).
	 *
	 * @param dtLib DataTables core library
	 * @returns
	 */
	use: (dtLib: DTType) => void;
}

// `any` here, so we can assign the `use` later - it is really a
// DataTableComponent though
const Component: any = React.forwardRef<DataTableRef, DataTableProps>(
	function DataTable(props, ref) {
		const tableEl = useRef<HTMLTableElement | null>(null);
		const table = useRef<DTApiType<any> | null>(null);
		const initialAdjust = useRef<boolean>(false);
		const options = useRef(props.options ?? {});
		const [portals, setPortals] = useState<React.ReactPortal[]>([]);
		const portalCache = useRef<SlotCache>(new Map());

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

		// Columns - can be from the prop, or in the options. Or neither, and
		// could be defined by the `<Column>` children
		if (props.columns) {
			options.current.columns = props.columns;
		}

		if (!options.current.columns) {
			options.current.columns = [];
		}

		columnComponents(
			portalCache.current,
			options.current.columns,
			props.children
		);

		// If slots are defined, create `columnDefs` entries for them to apply
		// to their target columns.
		if (props.slots) {
			applySlots(portalCache.current, options.current, props.slots);
		}

		// Create the DataTable when the `<table>` is ready in the document
		useEffect(() => {
			if (!DataTablesLib) {
				throw new Error(
					'DataTables library not set. See https://datatables.net/tn/23 for details.'
				);
			}

			if (tableEl.current && !table.current) {
				// As any, due to an error in the DT2 types which
				// doesn't include `on`
				if (!(options.current as any).on) {
					(options.current as any).on = {};
				}

				// We allow `on*` properties to be used for event listeners,
				// which need to be bound to the `on` property in the DataTable
				// initialisation object, allowing the event handlers to trigger
				// even during table initialisation / setup.
				dtEvents.forEach(name => {
					// Create the `on*` name from the DataTables event name,
					// which is camelCase and an `on` prefix.
					const onName =
						'on' +
						name[0]!.toUpperCase() +
						name
							.slice(1)
							.replace(/-[a-z]/g, match =>
								match[1]!.toUpperCase()
							);

					if ((props as any)[onName]) {
						(options.current as any).on[name] = (props as any)[
							onName
						];
					}
				});

				// Add the portals to the component's output
				(options.current as any).on['draw'] = () => {
					if (table.current) {
						const divs = Array.from(
							(
								table.current.table().body() as HTMLElement
							).querySelectorAll<HTMLDivElement>(
								'div.dt-react-portal'
							)
						);
						let portals = divs
							.map(div => portalCache.current.get(div))
							.filter(d => !!d);

						setPortals(portals);
					}
				};

				// Initialise the DataTable
				table.current = new DataTablesLib(
					tableEl.current,
					options.current
				);
			}

			return () => {
				if (table.current) {
					table.current.destroy();
					table.current = null;
				}
			};
		}, []);

		// If slots are used, we need to adjust the column widths to account
		// for the different data
		useLayoutEffect(() => {
			if (table.current && !initialAdjust.current) {
				console.log('doing layoutEffect');
				initialAdjust.current = true;
				table.current.ready(() => table.current!.columns.adjust());
			}
		});

		// On data change, clear and redraw
		useEffect(() => {
			if (props.data) {
				if (table.current) {
					initialAdjust.current = false;
					table.current.clear();
					table.current.rows.add(props.data).draw(false);
				}
			}
		}, [props.data]);

		return (
			<div>
				<table
					ref={tableEl}
					className={props.className ?? ''}
					id={props.id ?? ''}
				>
					{nonComponentChildren(props.children) ?? null}
				</table>
				{portals}
			</div>
		);
	}
);

Component.use = function (lib: DTType) {
	DataTablesLib = lib;
};

const Exporter: DataTableComponent = Component;

export default Exporter;

/**
 * Loop over the slots defined and apply them to their columns,
 * targeting based on the slot name (object key).
 *
 * @param cache Portal cache
 * @param options DataTables configuration object
 * @param slots Props passed in
 */
function applySlots(
	cache: SlotCache,
	options: DTConfig,
	slots: DataTableSlots
) {
	if (!options.columnDefs) {
		options.columnDefs = [];
	}

	Object.keys(slots).forEach(name => {
		const slot = slots[name];

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
 * Get children which are not Column components
 *
 * @param children
 * @returns Array of child nows
 */
function nonComponentChildren(children: ReactNode) {
	return React.Children.map(children, child => {
		if (!React.isValidElement(child)) {
			return;
		}

		return child.type !== Column ? child : null;
	})?.filter(c => !!c);
}

/**
 * Merge `<Column>` components into the DataTables configuration
 *
 * @param columns The columns array to be modified
 * @param children `<DataTable>` children
 */
function columnComponents(
	cache: SlotCache,
	columns: Array<ColumnOptions | null>,
	children: ReactNode
) {
	React.Children.forEach(children, (columnComp, i) => {
		if (!React.isValidElement(columnComp) || columnComp.type !== Column) {
			return;
		}

		if (!columns[i]) {
			columns[i] = {};
		}

		const columnOptions = columns[i];
		const columnProps = columnComp.props as ColumnProps;

		if (columnProps.title !== undefined) {
			columnOptions.title = columnProps.title;
		}

		if (columnProps.data !== undefined) {
			columnOptions.data = columnProps.data;
		}
		else if (columnOptions.data === undefined) {
			// Get the whole row as the data point in the renderer
			columnOptions.data = null;
		}

		if (columnProps.options) {
			Object.assign(columnOptions, columnProps.options);
		}

		if (columnProps.children) {
			let renderer = columnProps.children as any;

			if (columnProps.data) {
				columnOptions.render = {
					display: slotRenderer(cache, renderer)
				};
			}
			else {
				columnOptions.render = slotRenderer(cache, renderer);
			}

			// Limit the auto width calculations to use just the displayed rows
			// for this column. This prevents the children being rendered for
			// every row, even before they are needed for display. It is less
			// exact single there might be some off-page cells which are wider
			// than others, but the majority of the time, the components will
			// be the same size (e.g. buttons).
			if (! columnOptions.widthCalc) {
				columnOptions.widthCalc = 'display';
			}
		}
	});
}

/**
 * Create a rendering function that will create a React component for a cell's
 * rendering function.
 *
 * @param cache Portal cache
 * @param slot Function to create react component or orthogonal data
 * @returns Rendering function
 */
function slotRenderer(cache: SlotCache, slot: DataTableSlot) {
	return function (data: any, type: string, row: any, meta: object) {
		if (slot.length === 4) {
			const result = slot(data, type, row, meta);

			return React.isValidElement(result)
				? renderJsx(cache, result, meta)
				: result;
		}
		else if (slot.length === 3) {
			// The function takes three parameters so it allows for orthogonal
			// data - not possible to cache the response
			const result = slot(data, type, row, meta);

			return React.isValidElement(result)
				? renderJsx(cache, result, meta)
				: result;
		}

		// Otherwise, we are expecting a JSX return from the function every time
		// and we can cache it. Note the `slot as any` - Typescript doesn't
		// appear to like the two argument option for `DataTableSlot`.
		return slotCache(cache, () => (slot as any)(data, row), meta);
	};
}

/**
 * Render a slot's element and cache it
 */
function slotCache(cache: SlotCache, create: Function, meta: any) {
	// Execute the rendering function
	const result = create();

	// If the result is a JSX element, we need to render and then cache it
	if (React.isValidElement(result)) {
		return renderJsx(cache, result, meta);
	}

	// Any other data just gets returned
	return result;
}

/**
 * Render JSX into a div which can be shown in a cell
 *
 * @param cache The cache for already rendered components
 * @param jsx The JSX to create
 * @param meta Cell's meta data
 * @returns A host div element for the "slot"
 */
function renderJsx(
	cache: SlotCache,
	jsx: React.JSX.Element,
	meta: any
): HTMLDivElement {
	const div = document.createElement('div');
	const key = meta
		? `${meta.row}-${meta.col}`
		: Math.random().toString(36).substring(2);

	div.classList.add('dt-react-portal');

	cache.set(div, createPortal(jsx, div, key));

	return div;
}
