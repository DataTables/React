import { render } from '@testing-library/react';
import DT from 'datatables.net';
import { beforeEach, describe, expect, it } from 'vitest';

import DataTable, { Column } from '../dist/index';

describe('Child header elements', () => {
	beforeEach(() => {
		DataTable.use(DT);
	});

	it('Will create the header if it is not given', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data}>
				<Column title="MyId" data="id" />
				<Column title="MyName" data="name" />
			</DataTable>
		);

		const headerCells = container.querySelectorAll('thead th');

		expect(headerCells.length).toBe(2);
		expect(headerCells[0]?.textContent).toBe('MyId');
		expect(headerCells[1]?.textContent).toBe('MyName');
	});

	it('Can use a provided header', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data}>
				<thead>
					<tr>
						<th>Id</th>
						<th>Name</th>
					</tr>
				</thead>
				<Column data="id" />
				<Column data="name" />
			</DataTable>
		);

		const headerCells = container.querySelectorAll('thead th');

		expect(headerCells.length).toBe(2);
		expect(headerCells[0]?.textContent).toBe('Id');
		expect(headerCells[1]?.textContent).toBe('Name');
	});

	it('A complex header will render', async () => {
		const data = [
			{ id: 1, first: 'Alice', last: 'Angel' },
			{ id: 2, first: 'Bob', last: 'Buzz' }
		];

		const { container } = render(
			<DataTable data={data}>
				<thead>
					<tr>
						<th rowSpan={2}>Id</th>
						<th colSpan={2}>Name</th>
					</tr>
					<tr>
						<th>First</th>
						<th>Last</th>
					</tr>
				</thead>
				<Column data="id" />
				<Column data="first" />
				<Column data="last" />
			</DataTable>
		);

		const headerCells = container.querySelectorAll('thead th');

		expect(headerCells.length).toBe(4);
		expect(headerCells[0]?.textContent).toBe('Id');
		expect(headerCells[1]?.textContent).toBe('Name');
		expect(headerCells[2]?.textContent).toBe('First');
		expect(headerCells[3]?.textContent).toBe('Last');
	});

	it('Child node order makes no difference', async () => {
		const data = [
			{ id: 1, first: 'Alice', last: 'Angel' },
			{ id: 2, first: 'Bob', last: 'Buzz' }
		];

		const { container } = render(
			<DataTable data={data}>
				<Column data="id" />
				<Column data="first" />
				<Column data="last" />
				<thead>
					<tr>
						<th rowSpan={2}>Id</th>
						<th colSpan={2}>Name</th>
					</tr>
					<tr>
						<th>First</th>
						<th>Last</th>
					</tr>
				</thead>
			</DataTable>
		);

		const headerCells = container.querySelectorAll('thead th');

		expect(headerCells.length).toBe(4);
		expect(headerCells[0]?.textContent).toBe('Id');
		expect(headerCells[1]?.textContent).toBe('Name');
		expect(headerCells[2]?.textContent).toBe('First');
		expect(headerCells[3]?.textContent).toBe('Last');
	});

	it('Columns can specify more columns than the header has', async () => {
		const data = [
			{ id: 1, first: 'Alice', last: 'Angel' },
			{ id: 2, first: 'Bob', last: 'Buzz' }
		];

		const { container } = render(
			<DataTable data={data}>
				<Column title="ID" data="id" />
				<Column title="First" data="first" />
				<Column title="Last" data="last" />
				<thead>
					<tr>
						<th>Id</th>
						<th>Name</th>
					</tr>
				</thead>
			</DataTable>
		);

		const headerCells = container.querySelectorAll('thead th');

		expect(headerCells.length).toBe(3);
		expect(headerCells[0]?.textContent).toBe('ID');
		expect(headerCells[1]?.textContent).toBe('First');
		expect(headerCells[2]?.textContent).toBe('Last');
	});
});
