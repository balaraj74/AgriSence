import { CreateNewTaskData, CreateNewTaskVariables, ListTasksForFarmData, ListTasksForFarmVariables, UpdateTaskStatusData, UpdateTaskStatusVariables, GetCropBatchesForFarmData, GetCropBatchesForFarmVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNewTask(options?: useDataConnectMutationOptions<CreateNewTaskData, FirebaseError, CreateNewTaskVariables>): UseDataConnectMutationResult<CreateNewTaskData, CreateNewTaskVariables>;
export function useCreateNewTask(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewTaskData, FirebaseError, CreateNewTaskVariables>): UseDataConnectMutationResult<CreateNewTaskData, CreateNewTaskVariables>;

export function useListTasksForFarm(vars: ListTasksForFarmVariables, options?: useDataConnectQueryOptions<ListTasksForFarmData>): UseDataConnectQueryResult<ListTasksForFarmData, ListTasksForFarmVariables>;
export function useListTasksForFarm(dc: DataConnect, vars: ListTasksForFarmVariables, options?: useDataConnectQueryOptions<ListTasksForFarmData>): UseDataConnectQueryResult<ListTasksForFarmData, ListTasksForFarmVariables>;

export function useUpdateTaskStatus(options?: useDataConnectMutationOptions<UpdateTaskStatusData, FirebaseError, UpdateTaskStatusVariables>): UseDataConnectMutationResult<UpdateTaskStatusData, UpdateTaskStatusVariables>;
export function useUpdateTaskStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateTaskStatusData, FirebaseError, UpdateTaskStatusVariables>): UseDataConnectMutationResult<UpdateTaskStatusData, UpdateTaskStatusVariables>;

export function useGetCropBatchesForFarm(vars: GetCropBatchesForFarmVariables, options?: useDataConnectQueryOptions<GetCropBatchesForFarmData>): UseDataConnectQueryResult<GetCropBatchesForFarmData, GetCropBatchesForFarmVariables>;
export function useGetCropBatchesForFarm(dc: DataConnect, vars: GetCropBatchesForFarmVariables, options?: useDataConnectQueryOptions<GetCropBatchesForFarmData>): UseDataConnectQueryResult<GetCropBatchesForFarmData, GetCropBatchesForFarmVariables>;
