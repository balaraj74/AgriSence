const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createNewTaskRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewTask', inputVars);
}
createNewTaskRef.operationName = 'CreateNewTask';
exports.createNewTaskRef = createNewTaskRef;

exports.createNewTask = function createNewTask(dcOrVars, vars) {
  return executeMutation(createNewTaskRef(dcOrVars, vars));
};

const listTasksForFarmRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTasksForFarm', inputVars);
}
listTasksForFarmRef.operationName = 'ListTasksForFarm';
exports.listTasksForFarmRef = listTasksForFarmRef;

exports.listTasksForFarm = function listTasksForFarm(dcOrVars, vars) {
  return executeQuery(listTasksForFarmRef(dcOrVars, vars));
};

const updateTaskStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTaskStatus', inputVars);
}
updateTaskStatusRef.operationName = 'UpdateTaskStatus';
exports.updateTaskStatusRef = updateTaskStatusRef;

exports.updateTaskStatus = function updateTaskStatus(dcOrVars, vars) {
  return executeMutation(updateTaskStatusRef(dcOrVars, vars));
};

const getCropBatchesForFarmRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCropBatchesForFarm', inputVars);
}
getCropBatchesForFarmRef.operationName = 'GetCropBatchesForFarm';
exports.getCropBatchesForFarmRef = getCropBatchesForFarmRef;

exports.getCropBatchesForFarm = function getCropBatchesForFarm(dcOrVars, vars) {
  return executeQuery(getCropBatchesForFarmRef(dcOrVars, vars));
};
