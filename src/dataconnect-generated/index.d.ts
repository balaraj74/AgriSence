import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateNewTaskData {
  task_insert: Task_Key;
}

export interface CreateNewTaskVariables {
  title: string;
  status: string;
  dueDate: DateString;
  farmId: UUIDString;
  cropBatchId: UUIDString;
  assignedToId: UUIDString;
}

export interface CropBatch_Key {
  id: UUIDString;
  __typename?: 'CropBatch_Key';
}

export interface CropType_Key {
  id: UUIDString;
  __typename?: 'CropType_Key';
}

export interface Equipment_Key {
  id: UUIDString;
  __typename?: 'Equipment_Key';
}

export interface Farm_Key {
  id: UUIDString;
  __typename?: 'Farm_Key';
}

export interface GetCropBatchesForFarmData {
  cropBatches: ({
    id: UUIDString;
    expectedHarvestDate: DateString;
    fieldLocation: string;
  } & CropBatch_Key)[];
}

export interface GetCropBatchesForFarmVariables {
  farmId: UUIDString;
}

export interface ListTasksForFarmData {
  tasks: ({
    id: UUIDString;
    title: string;
    status: string;
    dueDate: DateString;
  } & Task_Key)[];
}

export interface ListTasksForFarmVariables {
  farmId: UUIDString;
}

export interface SensorReading_Key {
  id: UUIDString;
  __typename?: 'SensorReading_Key';
}

export interface Task_Key {
  id: UUIDString;
  __typename?: 'Task_Key';
}

export interface UpdateTaskStatusData {
  task_update?: Task_Key | null;
}

export interface UpdateTaskStatusVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewTaskRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewTaskVariables): MutationRef<CreateNewTaskData, CreateNewTaskVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewTaskVariables): MutationRef<CreateNewTaskData, CreateNewTaskVariables>;
  operationName: string;
}
export const createNewTaskRef: CreateNewTaskRef;

export function createNewTask(vars: CreateNewTaskVariables): MutationPromise<CreateNewTaskData, CreateNewTaskVariables>;
export function createNewTask(dc: DataConnect, vars: CreateNewTaskVariables): MutationPromise<CreateNewTaskData, CreateNewTaskVariables>;

interface ListTasksForFarmRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTasksForFarmVariables): QueryRef<ListTasksForFarmData, ListTasksForFarmVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListTasksForFarmVariables): QueryRef<ListTasksForFarmData, ListTasksForFarmVariables>;
  operationName: string;
}
export const listTasksForFarmRef: ListTasksForFarmRef;

export function listTasksForFarm(vars: ListTasksForFarmVariables): QueryPromise<ListTasksForFarmData, ListTasksForFarmVariables>;
export function listTasksForFarm(dc: DataConnect, vars: ListTasksForFarmVariables): QueryPromise<ListTasksForFarmData, ListTasksForFarmVariables>;

interface UpdateTaskStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
  operationName: string;
}
export const updateTaskStatusRef: UpdateTaskStatusRef;

export function updateTaskStatus(vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;
export function updateTaskStatus(dc: DataConnect, vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;

interface GetCropBatchesForFarmRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCropBatchesForFarmVariables): QueryRef<GetCropBatchesForFarmData, GetCropBatchesForFarmVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCropBatchesForFarmVariables): QueryRef<GetCropBatchesForFarmData, GetCropBatchesForFarmVariables>;
  operationName: string;
}
export const getCropBatchesForFarmRef: GetCropBatchesForFarmRef;

export function getCropBatchesForFarm(vars: GetCropBatchesForFarmVariables): QueryPromise<GetCropBatchesForFarmData, GetCropBatchesForFarmVariables>;
export function getCropBatchesForFarm(dc: DataConnect, vars: GetCropBatchesForFarmVariables): QueryPromise<GetCropBatchesForFarmData, GetCropBatchesForFarmVariables>;

