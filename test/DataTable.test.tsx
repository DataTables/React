import { render, screen } from '@testing-library/react';
import DT from 'datatables.net';
import { beforeEach, describe, expect, it } from 'vitest';

import DataTable, { Column } from '../dist/index';

describe('DataTable React Component', () => {
	beforeEach(() => {
		// Inject the DataTables library core before running tests
		DataTable.use(DT);
	});

	it('renders table headers defined via <Column> components', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		render(
			<DataTable data={data}>
				<Column data="id" title="User ID" />
				<Column data="name" title="Full Name" />
			</DataTable>
		);

		// Verify header titles render into the DOM
		expect(screen.getByText('User ID')).toBeInTheDocument();
		expect(screen.getByText('Full Name')).toBeInTheDocument();
	});

	it('renders custom JSX inside column render props', async () => {
		const data = [{ id: 99, name: 'Charlie' }];

		render(
			<DataTable data={data}>
				<Column data="name" title="Name" />
				<Column title="Actions">
					{(cellData, type, row) => (
						<button onClick={() => {}}>Edit {row.name}</button>
					)}
				</Column>
			</DataTable>
		);

		// DataTables rendering is synced via React portals
		expect(await screen.findByText('Edit Charlie')).toBeInTheDocument();
	});
});
