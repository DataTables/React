import { render } from '@testing-library/react';
import DT from 'datatables.net';
import { beforeEach, describe, expect, it } from 'vitest';

import DataTable, { Column } from '../dist/index';

describe('Child footer elements', () => {
	beforeEach(() => {
		DataTable.use(DT);
	});

	it('No footer created by default', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data}>
				<Column data="id" />
				<Column data="name" />
			</DataTable>
		);

		const footer = container.querySelectorAll('tfoot');

		expect(footer.length).toBe(0);
	});

	it('A footer can be provided', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data}>
				<tfoot>
					<tr>
						<th>1</th>
						<th>2</th>
					</tr>
				</tfoot>
				<Column title="Id" data="id" />
				<Column title="Name" data="name" />
			</DataTable>
		);

		const headerCells = container.querySelectorAll('thead th');

		expect(headerCells.length).toBe(2);
		expect(headerCells[0]?.textContent).toBe('Id');
		expect(headerCells[1]?.textContent).toBe('Name');

		const footerCells = container.querySelectorAll('tfoot th');

		expect(footerCells.length).toBe(2);
		expect(footerCells[0]?.textContent).toBe('1');
		expect(footerCells[1]?.textContent).toBe('2');
	});

	it('A header and footer can be provided', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data}>
				<thead>
					<tr>
						<th>1</th>
						<th>2</th>
					</tr>
				</thead>
				<tfoot>
					<tr>
						<th>3</th>
						<th>4</th>
					</tr>
				</tfoot>
				<Column data="id" />
				<Column data="name" />
			</DataTable>
		);

		const headerCells = container.querySelectorAll('thead th');

		expect(headerCells.length).toBe(2);
		expect(headerCells[0]?.textContent).toBe('1');
		expect(headerCells[1]?.textContent).toBe('2');

		const footerCells = container.querySelectorAll('tfoot th');

		expect(footerCells.length).toBe(2);
		expect(footerCells[0]?.textContent).toBe('3');
		expect(footerCells[1]?.textContent).toBe('4');
	});

	it('Order of elements does not matter', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data}>
				<Column data="id" />
				<Column data="name" />
				<thead>
					<tr>
						<th>1</th>
						<th>2</th>
					</tr>
				</thead>
				<tfoot>
					<tr>
						<th>3</th>
						<th>4</th>
					</tr>
				</tfoot>
			</DataTable>
		);

		const headerCells = container.querySelectorAll('thead th');

		expect(headerCells.length).toBe(2);
		expect(headerCells[0]?.textContent).toBe('1');
		expect(headerCells[1]?.textContent).toBe('2');

		const footerCells = container.querySelectorAll('tfoot th');

		expect(footerCells.length).toBe(2);
		expect(footerCells[0]?.textContent).toBe('3');
		expect(footerCells[1]?.textContent).toBe('4');
	});

	it('Order of elements can be split', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data}>
				<thead>
					<tr>
						<th>1</th>
						<th>2</th>
					</tr>
				</thead>
				<Column data="id" />
				<Column data="name" />
				<tfoot>
					<tr>
						<th>3</th>
						<th>4</th>
					</tr>
				</tfoot>
			</DataTable>
		);

		const headerCells = container.querySelectorAll('thead th');

		expect(headerCells.length).toBe(2);
		expect(headerCells[0]?.textContent).toBe('1');
		expect(headerCells[1]?.textContent).toBe('2');

		const footerCells = container.querySelectorAll('tfoot th');

		expect(footerCells.length).toBe(2);
		expect(footerCells[0]?.textContent).toBe('3');
		expect(footerCells[1]?.textContent).toBe('4');
	});
});
