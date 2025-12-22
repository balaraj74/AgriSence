# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListTasksForFarm*](#listtasksforfarm)
  - [*GetCropBatchesForFarm*](#getcropbatchesforfarm)
- [**Mutations**](#mutations)
  - [*CreateNewTask*](#createnewtask)
  - [*UpdateTaskStatus*](#updatetaskstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListTasksForFarm
You can execute the `ListTasksForFarm` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listTasksForFarm(vars: ListTasksForFarmVariables): QueryPromise<ListTasksForFarmData, ListTasksForFarmVariables>;

interface ListTasksForFarmRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTasksForFarmVariables): QueryRef<ListTasksForFarmData, ListTasksForFarmVariables>;
}
export const listTasksForFarmRef: ListTasksForFarmRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTasksForFarm(dc: DataConnect, vars: ListTasksForFarmVariables): QueryPromise<ListTasksForFarmData, ListTasksForFarmVariables>;

interface ListTasksForFarmRef {
  ...
  (dc: DataConnect, vars: ListTasksForFarmVariables): QueryRef<ListTasksForFarmData, ListTasksForFarmVariables>;
}
export const listTasksForFarmRef: ListTasksForFarmRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTasksForFarmRef:
```typescript
const name = listTasksForFarmRef.operationName;
console.log(name);
```

### Variables
The `ListTasksForFarm` query requires an argument of type `ListTasksForFarmVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListTasksForFarmVariables {
  farmId: UUIDString;
}
```
### Return Type
Recall that executing the `ListTasksForFarm` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTasksForFarmData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListTasksForFarmData {
  tasks: ({
    id: UUIDString;
    title: string;
    status: string;
    dueDate: DateString;
  } & Task_Key)[];
}
```
### Using `ListTasksForFarm`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTasksForFarm, ListTasksForFarmVariables } from '@dataconnect/generated';

// The `ListTasksForFarm` query requires an argument of type `ListTasksForFarmVariables`:
const listTasksForFarmVars: ListTasksForFarmVariables = {
  farmId: ..., 
};

// Call the `listTasksForFarm()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTasksForFarm(listTasksForFarmVars);
// Variables can be defined inline as well.
const { data } = await listTasksForFarm({ farmId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTasksForFarm(dataConnect, listTasksForFarmVars);

console.log(data.tasks);

// Or, you can use the `Promise` API.
listTasksForFarm(listTasksForFarmVars).then((response) => {
  const data = response.data;
  console.log(data.tasks);
});
```

### Using `ListTasksForFarm`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTasksForFarmRef, ListTasksForFarmVariables } from '@dataconnect/generated';

// The `ListTasksForFarm` query requires an argument of type `ListTasksForFarmVariables`:
const listTasksForFarmVars: ListTasksForFarmVariables = {
  farmId: ..., 
};

// Call the `listTasksForFarmRef()` function to get a reference to the query.
const ref = listTasksForFarmRef(listTasksForFarmVars);
// Variables can be defined inline as well.
const ref = listTasksForFarmRef({ farmId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTasksForFarmRef(dataConnect, listTasksForFarmVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tasks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tasks);
});
```

## GetCropBatchesForFarm
You can execute the `GetCropBatchesForFarm` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCropBatchesForFarm(vars: GetCropBatchesForFarmVariables): QueryPromise<GetCropBatchesForFarmData, GetCropBatchesForFarmVariables>;

interface GetCropBatchesForFarmRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCropBatchesForFarmVariables): QueryRef<GetCropBatchesForFarmData, GetCropBatchesForFarmVariables>;
}
export const getCropBatchesForFarmRef: GetCropBatchesForFarmRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCropBatchesForFarm(dc: DataConnect, vars: GetCropBatchesForFarmVariables): QueryPromise<GetCropBatchesForFarmData, GetCropBatchesForFarmVariables>;

interface GetCropBatchesForFarmRef {
  ...
  (dc: DataConnect, vars: GetCropBatchesForFarmVariables): QueryRef<GetCropBatchesForFarmData, GetCropBatchesForFarmVariables>;
}
export const getCropBatchesForFarmRef: GetCropBatchesForFarmRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCropBatchesForFarmRef:
```typescript
const name = getCropBatchesForFarmRef.operationName;
console.log(name);
```

### Variables
The `GetCropBatchesForFarm` query requires an argument of type `GetCropBatchesForFarmVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCropBatchesForFarmVariables {
  farmId: UUIDString;
}
```
### Return Type
Recall that executing the `GetCropBatchesForFarm` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCropBatchesForFarmData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCropBatchesForFarmData {
  cropBatches: ({
    id: UUIDString;
    expectedHarvestDate: DateString;
    fieldLocation: string;
  } & CropBatch_Key)[];
}
```
### Using `GetCropBatchesForFarm`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCropBatchesForFarm, GetCropBatchesForFarmVariables } from '@dataconnect/generated';

// The `GetCropBatchesForFarm` query requires an argument of type `GetCropBatchesForFarmVariables`:
const getCropBatchesForFarmVars: GetCropBatchesForFarmVariables = {
  farmId: ..., 
};

// Call the `getCropBatchesForFarm()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCropBatchesForFarm(getCropBatchesForFarmVars);
// Variables can be defined inline as well.
const { data } = await getCropBatchesForFarm({ farmId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCropBatchesForFarm(dataConnect, getCropBatchesForFarmVars);

console.log(data.cropBatches);

// Or, you can use the `Promise` API.
getCropBatchesForFarm(getCropBatchesForFarmVars).then((response) => {
  const data = response.data;
  console.log(data.cropBatches);
});
```

### Using `GetCropBatchesForFarm`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCropBatchesForFarmRef, GetCropBatchesForFarmVariables } from '@dataconnect/generated';

// The `GetCropBatchesForFarm` query requires an argument of type `GetCropBatchesForFarmVariables`:
const getCropBatchesForFarmVars: GetCropBatchesForFarmVariables = {
  farmId: ..., 
};

// Call the `getCropBatchesForFarmRef()` function to get a reference to the query.
const ref = getCropBatchesForFarmRef(getCropBatchesForFarmVars);
// Variables can be defined inline as well.
const ref = getCropBatchesForFarmRef({ farmId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCropBatchesForFarmRef(dataConnect, getCropBatchesForFarmVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.cropBatches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.cropBatches);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewTask
You can execute the `CreateNewTask` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewTask(vars: CreateNewTaskVariables): MutationPromise<CreateNewTaskData, CreateNewTaskVariables>;

interface CreateNewTaskRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewTaskVariables): MutationRef<CreateNewTaskData, CreateNewTaskVariables>;
}
export const createNewTaskRef: CreateNewTaskRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewTask(dc: DataConnect, vars: CreateNewTaskVariables): MutationPromise<CreateNewTaskData, CreateNewTaskVariables>;

interface CreateNewTaskRef {
  ...
  (dc: DataConnect, vars: CreateNewTaskVariables): MutationRef<CreateNewTaskData, CreateNewTaskVariables>;
}
export const createNewTaskRef: CreateNewTaskRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewTaskRef:
```typescript
const name = createNewTaskRef.operationName;
console.log(name);
```

### Variables
The `CreateNewTask` mutation requires an argument of type `CreateNewTaskVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewTaskVariables {
  title: string;
  status: string;
  dueDate: DateString;
  farmId: UUIDString;
  cropBatchId: UUIDString;
  assignedToId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateNewTask` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewTaskData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewTaskData {
  task_insert: Task_Key;
}
```
### Using `CreateNewTask`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewTask, CreateNewTaskVariables } from '@dataconnect/generated';

// The `CreateNewTask` mutation requires an argument of type `CreateNewTaskVariables`:
const createNewTaskVars: CreateNewTaskVariables = {
  title: ..., 
  status: ..., 
  dueDate: ..., 
  farmId: ..., 
  cropBatchId: ..., 
  assignedToId: ..., 
};

// Call the `createNewTask()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewTask(createNewTaskVars);
// Variables can be defined inline as well.
const { data } = await createNewTask({ title: ..., status: ..., dueDate: ..., farmId: ..., cropBatchId: ..., assignedToId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewTask(dataConnect, createNewTaskVars);

console.log(data.task_insert);

// Or, you can use the `Promise` API.
createNewTask(createNewTaskVars).then((response) => {
  const data = response.data;
  console.log(data.task_insert);
});
```

### Using `CreateNewTask`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewTaskRef, CreateNewTaskVariables } from '@dataconnect/generated';

// The `CreateNewTask` mutation requires an argument of type `CreateNewTaskVariables`:
const createNewTaskVars: CreateNewTaskVariables = {
  title: ..., 
  status: ..., 
  dueDate: ..., 
  farmId: ..., 
  cropBatchId: ..., 
  assignedToId: ..., 
};

// Call the `createNewTaskRef()` function to get a reference to the mutation.
const ref = createNewTaskRef(createNewTaskVars);
// Variables can be defined inline as well.
const ref = createNewTaskRef({ title: ..., status: ..., dueDate: ..., farmId: ..., cropBatchId: ..., assignedToId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewTaskRef(dataConnect, createNewTaskVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.task_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.task_insert);
});
```

## UpdateTaskStatus
You can execute the `UpdateTaskStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateTaskStatus(vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;

interface UpdateTaskStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
}
export const updateTaskStatusRef: UpdateTaskStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTaskStatus(dc: DataConnect, vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;

interface UpdateTaskStatusRef {
  ...
  (dc: DataConnect, vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
}
export const updateTaskStatusRef: UpdateTaskStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTaskStatusRef:
```typescript
const name = updateTaskStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateTaskStatus` mutation requires an argument of type `UpdateTaskStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTaskStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateTaskStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTaskStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTaskStatusData {
  task_update?: Task_Key | null;
}
```
### Using `UpdateTaskStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTaskStatus, UpdateTaskStatusVariables } from '@dataconnect/generated';

// The `UpdateTaskStatus` mutation requires an argument of type `UpdateTaskStatusVariables`:
const updateTaskStatusVars: UpdateTaskStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateTaskStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTaskStatus(updateTaskStatusVars);
// Variables can be defined inline as well.
const { data } = await updateTaskStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTaskStatus(dataConnect, updateTaskStatusVars);

console.log(data.task_update);

// Or, you can use the `Promise` API.
updateTaskStatus(updateTaskStatusVars).then((response) => {
  const data = response.data;
  console.log(data.task_update);
});
```

### Using `UpdateTaskStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTaskStatusRef, UpdateTaskStatusVariables } from '@dataconnect/generated';

// The `UpdateTaskStatus` mutation requires an argument of type `UpdateTaskStatusVariables`:
const updateTaskStatusVars: UpdateTaskStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateTaskStatusRef()` function to get a reference to the mutation.
const ref = updateTaskStatusRef(updateTaskStatusVars);
// Variables can be defined inline as well.
const ref = updateTaskStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTaskStatusRef(dataConnect, updateTaskStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.task_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.task_update);
});
```

