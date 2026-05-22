import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

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

/** Generated Node Admin SDK operation action function for the 'CreateNewTask' Mutation. Allow users to execute without passing in DataConnect. */
export function createNewTask(dc: DataConnect, vars: CreateNewTaskVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateNewTaskData>>;
/** Generated Node Admin SDK operation action function for the 'CreateNewTask' Mutation. Allow users to pass in custom DataConnect instances. */
export function createNewTask(vars: CreateNewTaskVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateNewTaskData>>;

/** Generated Node Admin SDK operation action function for the 'ListTasksForFarm' Query. Allow users to execute without passing in DataConnect. */
export function listTasksForFarm(dc: DataConnect, vars: ListTasksForFarmVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTasksForFarmData>>;
/** Generated Node Admin SDK operation action function for the 'ListTasksForFarm' Query. Allow users to pass in custom DataConnect instances. */
export function listTasksForFarm(vars: ListTasksForFarmVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTasksForFarmData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateTaskStatus' Mutation. Allow users to execute without passing in DataConnect. */
export function updateTaskStatus(dc: DataConnect, vars: UpdateTaskStatusVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateTaskStatusData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateTaskStatus' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateTaskStatus(vars: UpdateTaskStatusVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateTaskStatusData>>;

/** Generated Node Admin SDK operation action function for the 'GetCropBatchesForFarm' Query. Allow users to execute without passing in DataConnect. */
export function getCropBatchesForFarm(dc: DataConnect, vars: GetCropBatchesForFarmVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCropBatchesForFarmData>>;
/** Generated Node Admin SDK operation action function for the 'GetCropBatchesForFarm' Query. Allow users to pass in custom DataConnect instances. */
export function getCropBatchesForFarm(vars: GetCropBatchesForFarmVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCropBatchesForFarmData>>;

