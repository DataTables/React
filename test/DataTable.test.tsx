import { render, waitFor } from '@testing-library/react';
import DT from 'datatables.net';
import { beforeEach, describe, expect, it } from 'vitest';

import { createRef } from 'react';
import DataTable, { Column, DataTableRef } from '../dist/index';

describe('DataTable props', () => {
	const mockAjax = (dataToSend: any, callback: Function) => {
        // Simulate an AJAX response from a server
        callback({
            data: [
                { name: 'Airi Satou', position: 'Accountant' },
                { name: 'Angelica Ramos', position: 'CEO' }
            ]
        });
    };

	beforeEach(() => {
		DataTable.use(DT);
	});

	it('Simple DataTable test', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data}>
				<Column title="ID" data="id" />
				<Column title="Name" data="name" />
			</DataTable>
		);

		const headerCells = container.querySelectorAll('thead th');
		expect(headerCells.length).toBe(2);
		expect(headerCells[0]?.textContent).toBe('ID');
		expect(headerCells[1]?.textContent).toBe('Name');

		const cells = container.querySelectorAll('tbody tr td');
		expect(cells.length).toBe(4);
		expect(cells[0]?.textContent).toBe('1');
		expect(cells[1]?.textContent).toBe('Alice');
		expect(cells[2]?.textContent).toBe('2');
		expect(cells[3]?.textContent).toBe('Bob');
	});

	it('Can set an id on the table', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data} id="test">
				<Column title="ID" data="id" />
				<Column title="Name" data="name" />
			</DataTable>
		);

		const table = container.querySelector('table#test');
		expect(table).toHaveAttribute('id', 'test');
	});

	it('Can set a className on the table', async () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data} className="testClass">
				<Column title="ID" data="id" />
				<Column title="Name" data="name" />
			</DataTable>
		);

		await waitFor(() => {
			const table = container.querySelector(
				'table.dataTable'
			);
			expect(table).toHaveClass('testClass');
		});
	});

	it('Can set an Ajax data source', async () => {
		const { container } = render(
			<DataTable ajax={mockAjax}>
				<Column title="Name" data="name" />
				<Column title="Position" data="position" />
			</DataTable>
		);

		await waitFor(() => {
			const firstCell = container.querySelector('tbody tr:first-child td');
			expect(firstCell).toHaveTextContent('Airi Satou');
		});
	});

	it('Can set options', async () => {
		const { container } = render(
			<DataTable ajax={mockAjax} options={{pageLength: 1}}>
				<Column title="Name" data="name" />
				<Column title="Position" data="position" />
			</DataTable>
		);

		await waitFor(() => {
			const rows = container.querySelectorAll('tbody tr');
			expect(rows.length).toBe(1);
		});
	});

	it('Can use the API options', async () => {
		const table = createRef<DataTableRef>();
		render(
			<DataTable ajax={mockAjax} ref={table}>
				<Column title="Name" data="name" />
				<Column title="Position" data="position" />
			</DataTable>
		);

		await waitFor(() => {
			expect(table.current!.dt()!.page.info().recordsDisplay).toBe(2);
		});
	});
});
