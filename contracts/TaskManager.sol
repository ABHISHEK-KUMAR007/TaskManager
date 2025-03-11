// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TaskManager is Ownable {
    struct Task {
        string title;
        string description;
        bool completed;
        address owner;
        bool exists;
    }

    mapping(uint256 => Task) private tasks;
    uint256 private taskIdCounter;
    
    
    event TaskAdded(uint256 indexed taskId, address indexed owner, string title);
    event TaskCompleted(uint256 indexed taskId, address indexed owner);
    event TaskEdited(uint256 indexed taskId, address indexed owner);
    event TaskDeleted(uint256 indexed taskId, address indexed owner);
    
    constructor() Ownable(msg.sender) {}
    
   
    function addTask(string memory _title, string memory _description) public returns (uint256) {
        uint256 taskId = taskIdCounter;
        
        tasks[taskId] = Task({
            title: _title,
            description: _description,
            completed: false,
            owner: msg.sender,
            exists: true
        });
        
        taskIdCounter++;
        
        emit TaskAdded(taskId, msg.sender, _title);
        
        return taskId;
    }
    
    
    function completeTask(uint256 _taskId) public {
        require(tasks[_taskId].exists, "Task does not exist");
        require(tasks[_taskId].owner == msg.sender, "Only the task owner can complete this task");
        require(!tasks[_taskId].completed, "Task is already completed");
        
        tasks[_taskId].completed = true;
        
        emit TaskCompleted(_taskId, msg.sender);
    }
    
    
    function editTask(uint256 _taskId, string memory _title, string memory _description) public {
        require(tasks[_taskId].exists, "Task does not exist");
        require(tasks[_taskId].owner == msg.sender, "Only the task owner can edit this task");
        
        tasks[_taskId].title = _title;
        tasks[_taskId].description = _description;
        
        emit TaskEdited(_taskId, msg.sender);
    }
    
    
    function deleteTask(uint256 _taskId) public {
        require(tasks[_taskId].exists, "Task does not exist");
        require(tasks[_taskId].owner == msg.sender, "Only the task owner can delete this task");
        
        delete tasks[_taskId];
        
        emit TaskDeleted(_taskId, msg.sender);
    }
   
    function getTask(uint256 _taskId) public view returns (string memory, string memory, bool, address) {
        require(tasks[_taskId].exists, "Task does not exist");
        
        Task memory task = tasks[_taskId];
        return (task.title, task.description, task.completed, task.owner);
    }
    
   
    function taskExists(uint256 _taskId) public view returns (bool) {
        return tasks[_taskId].exists;
    }
    
   
    function getTaskCount() public view returns (uint256) {
        return taskIdCounter;
    }
    
    function getAllTasks() public view returns (uint256[] memory) {
        uint256 counter = 0;
        
        for (uint256 i = 0; i < taskIdCounter; i++) {
            if (tasks[i].exists) {
                counter++;
            }
        }
        
        uint256[] memory allTaskIds = new uint256[](counter);
        counter = 0;
        
        for (uint256 i = 0; i < taskIdCounter; i++) {
            if (tasks[i].exists) {
                allTaskIds[counter] = i;
                counter++;
            }
        }
        
        return allTaskIds;
    }
}