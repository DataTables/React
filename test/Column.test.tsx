import { render } from '@testing-library/react';
import DT from 'datatables.net';
import { beforeEach, describe, expect, it } from 'vitest';

import DataTable, { Column } from '../dist/index';

describe('Column properties', () => {
	beforeEach(() => {
		DataTable.use(DT);
	});

	it('Default sets no name', () => {
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

		const headerCells = container.querySelectorAll('thead th');

		expect(headerCells.length).toBe(2);
		expect(headerCells[0]?.textContent).toBe('');
		expect(headerCells[1]?.textContent).toBe('');
	});

	it('Data is correctly displayed', () => {
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

		const rows = container.querySelectorAll('tbody tr');
		expect(rows.length).toBe(2);

		const cells = container.querySelectorAll('tbody tr td');
		expect(cells.length).toBe(4);
		expect(cells[0]?.textContent).toBe('1');
		expect(cells[1]?.textContent).toBe('Alice');
		expect(cells[2]?.textContent).toBe('2');
		expect(cells[3]?.textContent).toBe('Bob');
	});

	it('Can set column visibility', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data}>
				<Column data="id" />
				<Column data="name" options={{visible: false}} />
			</DataTable>
		);

		const rows = container.querySelectorAll('tbody tr');
		expect(rows.length).toBe(2);

		const cells = container.querySelectorAll('tbody tr td');
		expect(cells.length).toBe(2);
		expect(cells[0]?.textContent).toBe('1');
		expect(cells[1]?.textContent).toBe('2');
	});

	it('Can use static content as a child', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data}>
				<Column>
					Test
				</Column>
				<Column data="name" />
			</DataTable>
		);

		const rows = container.querySelectorAll('tbody tr');
		expect(rows.length).toBe(2);

		const cells = container.querySelectorAll('tbody tr td');
		expect(cells.length).toBe(4);
		expect(cells[0]?.textContent).toBe('Test');
		expect(cells[1]?.textContent).toBe('Alice');
		expect(cells[2]?.textContent).toBe('Test');
		expect(cells[3]?.textContent).toBe('Bob');
	});

	it('Can use a static child component', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const Button = () => <button>Button</button>;
		const { container } = render(
			<DataTable data={data}>
				<Column>
					<Button />
				</Column>
				<Column data="name" />
			</DataTable>
		);

		const rows = container.querySelectorAll('tbody tr');
		expect(rows.length).toBe(2);

		const cells = container.querySelectorAll('tbody tr td');
		expect(cells.length).toBe(4);
		expect(cells[0]?.textContent).toBe('Button');
		expect(cells[1]?.textContent).toBe('Alice');
		expect(cells[2]?.textContent).toBe('Button');
		expect(cells[3]?.textContent).toBe('Bob');
	});

	it('Can use a rendering function as a child', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data}>
				<Column data="id">
					{id => <em>{id}</em>}
				</Column>
				<Column data="name" />
			</DataTable>
		);

		const rows = container.querySelectorAll('tbody tr');
		expect(rows.length).toBe(2);

		const cells = container.querySelectorAll('tbody tr td');
		expect(cells.length).toBe(4);
		expect(cells[0]?.textContent).toBe('1');
		expect(cells[0]?.querySelectorAll('em').length).toBe(1);
		expect(cells[1]?.textContent).toBe('Alice');
		expect(cells[1]?.querySelectorAll('em').length).toBe(0);
		expect(cells[2]?.textContent).toBe('2');
		expect(cells[2]?.querySelectorAll('em').length).toBe(1);
		expect(cells[3]?.textContent).toBe('Bob');
		expect(cells[3]?.querySelectorAll('em').length).toBe(0);
	});

	it('Can use a component that renders data', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const Button = (props: {text: string}) => <button>{props.text}</button>;
		const { container } = render(
			<DataTable data={data}>
				<Column data="id">
					{id => <Button text={id} />}
				</Column>
				<Column data="name" />
			</DataTable>
		);

		const rows = container.querySelectorAll('tbody tr');
		expect(rows.length).toBe(2);

		const cells = container.querySelectorAll('tbody tr td');
		expect(cells.length).toBe(4);
		expect(cells[0]?.textContent).toBe('1');
		expect(cells[1]?.textContent).toBe('Alice');
		expect(cells[2]?.textContent).toBe('2');
		expect(cells[3]?.textContent).toBe('Bob');
	});

	it('Set a footer', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data}>
				<Column title="h1" footer="f1" data="id" />
				<Column title="h2" footer="f2" data="name" />
			</DataTable>
		);

		const headerCells = container.querySelectorAll('thead th');
		expect(headerCells.length).toBe(2);
		expect(headerCells[0]?.textContent).toBe('h1');
		expect(headerCells[1]?.textContent).toBe('h2');

		const footerCells = container.querySelectorAll('tfoot th');
		expect(footerCells.length).toBe(2);
		expect(footerCells[0]?.textContent).toBe('f1');
		expect(footerCells[1]?.textContent).toBe('f2');
	});

	it('Footer with an empty string', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data}>
				<Column title="h1" footer="" data="id" />
				<Column title="h2" footer="f2" data="name" />
			</DataTable>
		);

		const headerCells = container.querySelectorAll('thead th');
		expect(headerCells.length).toBe(2);
		expect(headerCells[0]?.textContent).toBe('h1');
		expect(headerCells[1]?.textContent).toBe('h2');

		const footerCells = container.querySelectorAll('tfoot th');
		expect(footerCells.length).toBe(2);
		expect(footerCells[0]?.textContent).toBe('');
		expect(footerCells[1]?.textContent).toBe('f2');
	});

	it('Footer with an empty string', () => {
		const data = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		];

		const { container } = render(
			<DataTable data={data}>
				<Column title="h1" data="id" />
				<Column title="h2"data="name" />
			</DataTable>
		);

		const headerCells = container.querySelectorAll('thead th');
		expect(headerCells.length).toBe(2);
		expect(headerCells[0]?.textContent).toBe('h1');
		expect(headerCells[1]?.textContent).toBe('h2');

		const footerCells = container.querySelectorAll('tfoot th');
		expect(footerCells.length).toBe(0);
	});
});
