
# DataTables component for React

This library provides a React component for [DataTables.net](https://datatables.net) to be used inside a [React application](https://react.dev/).


## Installation

Install the `datatables.net-react` and `datatables.net-dt` packages using your package manager:

```
npm install --save datatables.net-react datatables.net-dt
```

To then use DataTables component in your own components, you need to `import` both it and DataTables core, then assign DataTables core as the library to use in the component like this:

```js
// JS
import DataTable, { Column } from 'datatables.net-react';
import DtCore from 'datatables.net-dt';

// CSS
import 'datatables.net-dt/css';

// Apply DataTables core to the React component
DataTable.use(DtCore);
```

This will give you a `<DataTable>` React component you can use in your components.

Note the use of the `-dt` postfix for the core DataTables library. This represents the DataTables default styling. Other styling packages such as for Bootstrap, Bulma and Semantic UI are also available. Use the [DataTables download builder](https://datatables.net/download) to get a list of the packages to use.


## Use

Once installed and registered in your component you will have a `<DataTable>` component available for use in your JSX (you can change the name by changing the `import` statement used above if you prefer something else). You will be able to see that we also import a `<Column>` component above, this allows columns to be defined:

```html
<DataTable>
	<Column title="Name" data="name" />
	<Column title="Position" data="position" />
</DataTable>
```


## Documentation

Please refer to the [DataTables React documentation](https://datatables.net/manual/components/react) for full details on how to work with the DataTables React component, including details on working with events, the DataTables API and React components in the table. There are also a number of running examples available.
