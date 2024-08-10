import {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';

import dtEvents from './events';

import type DTType from 'datatables.net';
import type {Api as DTApiType} from 'datatables.net';

let DataTablesLib: DTType<any> | null = null;

export default function DataTable(props: any) {
	const tableEl = useRef<HTMLTableElement | null>(null);
	const table = useRef<DTApiType<any> | null>(null);
	const options = useRef(props.options ?? {});

	// Expose some of the more common settings as props
	if (props.data) {
		options.current.data = props.data;
	}

	if (props.columns) {
		options.current.columns = props.columns;
	}

	if (props.ajax) {
		options.current.ajax = props.ajax;
	}

	useEffect(() => {
		if (!DataTablesLib) {
			throw new Error('DataTables library not set. See https://datatables.net/tn/19 for details.');
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

				if (props[onName]) {
					table$.on(name + '.dt', props[onName]);
				}
			});

			options.current.columns[1].render = function (data: any, type: string, row: any) {
				if (type === 'display') {
					let div = document.createElement('div');

					let root = createRoot(div);
					root.render(props.named(data, row));

					return div;
				}

				return data;
			};

			// Initialise the DataTable
			(table as any).current = new DataTablesLib(tableEl.current, options.current);
		}

		// Tidy up
		return () => {
			if (table.current) {
				table.current.destroy();
			}
		};
	}, []);

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
				{props.children ?? props.text}
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

// Object.defineProperty(DataTable, "lib", {
// 	get() {
// 		return DataTablesLib;
// 	},

// 	set(lib: DTType<any>) {
// 		DataTablesLib = lib;
// 	}
// });
