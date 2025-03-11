import { useState, useEffect } from "react";
import ABI from "../ABI/taskManager.json";
import { ethers, Contract } from "ethers";
import "./App.css";

function App() {
  const [contractSigner, setContractSigner] = useState(null);
  const [contractProvider, setContractProvider] = useState(null);
  const [account, setAccount] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "" });

  const ContractAddress = "0xF05a94Ab356aAB4a736ff5DE207971A036c37a49";

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contractProvider = new Contract(ContractAddress, ABI, provider);
      const contractSigner = new Contract(ContractAddress, ABI, signer);

      setAccount(accounts[0]);
      setContractProvider(contractProvider);
      setContractSigner(contractSigner);

      console.log("Wallet connected:", accounts[0]);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      alert("Failed to connect wallet.");
    }
  };

  
  useEffect(() => {
    if (contractProvider && account) {
      fetchMyTasks();
    }
  }, [contractProvider, account]);



  const fetchMyTasks = async () => {
    if (!contractProvider || !account) {
        console.log("Provider or account not available.");
        return;
    }

    try {
        const taskIds = await contractProvider.getAllTasks();
        console.log("🔍 Raw Task IDs:", Array.isArray(taskIds));
        const fetchedTasks = await Promise.all(
          taskIds.map(async (taskId) => {
                const task = await contractProvider.getTask(taskId);
                console.log(`Fetched Task ${taskId}:`, task);

                return {
                    id: Number(taskId),
                    title: task[0],
                    description: task[1],
                    completed: task[2],
                    owner: task[3],
                };
            })
        );

        console.log("Final Fetched Tasks:", fetchedTasks);
        setTasks(fetchedTasks);
    } catch (err) {
        console.error("Error fetching tasks:", err);
    }
};

  /** Add a Task */
  const addTask = async () => {
    if (!contractSigner) return alert("Connect wallet first!");
    if (!newTask.title || !newTask.description) return alert("Enter task details!");

    try {
      const tx = await contractSigner.addTask(newTask.title, newTask.description);
      await tx.wait();
      alert("Task added successfully!");
      setNewTask({ title: "", description: "" });
      fetchMyTasks();
    } catch (err) {
      console.error("Error adding task:", err);
      alert("Failed to add task.");
    }
  };

  /** Complete a Task */
  const completeTask = async (taskId) => {
    if (!contractSigner) return alert("Connect wallet first!");
    try {
      const tx = await contractSigner.completeTask(taskId);
      await tx.wait();
      alert("Task completed!");
      fetchMyTasks();
    } catch (err) {
      console.error("Error completing task:", err);
      alert("Failed to complete task.");
    }
  };

  /** Edit a Task */
  const editTask = async (taskId) => {
    if (!contractSigner) return alert("Connect wallet first!");
    const newTitle = prompt("Enter new title:");
    const newDescription = prompt("Enter new description:");
    if (!newTitle || !newDescription) return;

    try {
      const tx = await contractSigner.editTask(taskId, newTitle, newDescription);
      await tx.wait();
      alert("Task updated successfully!");
      fetchMyTasks();
    } catch (err) {
      console.error("Error editing task:", err);
      alert("Failed to update task.");
    }
  };

  /** Delete a Task */
  const deleteTask = async (taskId) => {
    if (!contractSigner) return alert("Connect wallet first!");
    try {
      const tx = await contractSigner.deleteTask(taskId);
      await tx.wait();
      alert("Task deleted!");
      fetchMyTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task.");
    }
  };

  return (
    <div className="app">
      <h1>Blockchain Task Manager</h1>

      {account ? (
        <>
          <p><strong>Connected Account:</strong> {account}</p>

          <div className="task-input">
            <input
              type="text"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Task Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <button onClick={addTask}>Add Task</button>
          </div>

          <h2>My Tasks</h2>
          <ul className="task-list">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <li key={task.id} className="task-item">
                  <span className="task-title">
                    <strong>{task.title}</strong>: {task.description} {task.completed ? "✅" : "❌"}
                  </span>
                  <div className="task-actions">
                    {!task.completed && <button onClick={() => completeTask(task.id)}>Complete</button>}
                    <button onClick={() => editTask(task.id)}>Edit</button>
                    <button onClick={() => deleteTask(task.id)}>Delete</button>
                  </div>
                </li>
              ))
            ) : (
              <p>No tasks found.</p>
            )}
          </ul>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default App;
