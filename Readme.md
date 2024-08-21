
# DataTables component for React

This library provides a React component for [DataTables.net](https://datatables.net) to be used inside a [React application](https://react.dev/).


## Installation

Install the `datatables.net-react` and `datatables.net-dt` packages using your package manager:

```
# npm
npm install --save datatables.net-react datatables.net-dt

# yarn
yarn add datatables.net-react datatables.net-dt
```

To then use DataTables component in your own components, you need to `import` both it and DataTables core, then assign DataTables core as the library to use in the component like this:

```js
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';

DataTable.use(DT);
```

This will give you a `<DataTable>` React component you can use in your components.

Note the use of the `-dt` postfix for the core DataTables library. This represents the DataTables default styling. Other styling packages such as for Bootstrap, Bulma and Semantic UI are also available. Use the [DataTables download builder](https://datatables.net/download) to get a list of the packages to use.


## Use

Once installed and registered in your component you will have a `<DataTable>` component available for use in your JSX (you can change the name by changing the `import` statement used above if you prefer something else). It accepts child elements which can be used to describe the table's headers and footers:

```html
<DataTable>
	<thead>
		<tr>
			<th>Name</th>
			<th>Location</th>
		</tr>
	</thead>
</DataTable>
```


## Attributes

The `<DataTable>` component has the following attributes that can be assigned for configuration of the DataTable:

* `ajax` - [Ajax option for DataTables](/reference/option/ajax) - to load data for the table over Ajax.
* `className` - Class name to assign to the `-tag table`
* `columns` - Define the columns array used for [DataTables initialisation](/reference/option/#datatables%20-%20columns)
* `data` - [Data array for DataTables](/reference/option/data). This is _optional_ and if you are using Ajax to load the DataTable this attribute should not be used.
* `options` - The [DataTables options](/reference/option) for the table. Note that this can include `columns`, `data` and `ajax` - if they are provided by one of the properties from above that will override a matching option given here.
* `slots` - An object containing slot functions that can be used to display React components inside the DataTable columns. See the _React Components_ section below.
* `on*` - Event functions - see the _Events_ section below.


## Initialisation

The most basic example use of DataTables in a React application is shown below:

```html
import { useState } from 'react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';

import './App.css';

DataTable.use(DT);

function App() {
  const [tableData, setTableData] = useState([
    [ 'Tiger Nixon', 'System Architect' ],
    [ 'Garrett Winters', 'Accountant' ],
	// ...
  ]);

  return (
		<DataTable data={tableData} className="display">
			<thead>
				<tr>
					<th>Name</th>
					<th>Position</th>
				</tr>
			</thead>
		</DataTable>
	);
}

export default App;
```


## Documentation

Please refer to the [DataTables React documentation](https://datatables.net/manual/react) for full details on how to work with the DataTables React component, including details on working with events, the DataTables API and React components in the table. There are also a number of running examples available.
