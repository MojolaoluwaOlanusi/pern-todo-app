// javascript
import {useEffect, useState} from "react";
import axios from "axios";
import {MdModeEditOutline, MdOutlineDone} from "react-icons/md";
import {FaTrash} from "react-icons/fa6";
import {IoClose} from "react-icons/io5";
import {FiSun, FiMoon} from "react-icons/fi";

function App() {

    const [description, setDescription] = useState("");
    const [todos, setTodos] = useState([]);
    const [editingTodo, setEditingTodo] = useState(null);
    const [editedText, setEditedText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("theme");
        if (saved) return saved;
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });

    useEffect(() => {
        localStorage.setItem("theme", theme);
    }, [theme]);

    const isDark = theme === "dark";

    const getTodos = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get("http://localhost:5000/todos");
            setTodos(res.data);
            console.log(res.data);
        } catch (e) {
            console.error(e.message);
            setError("Failed to fetch todos. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getTodos();
    }, []);

    const onSubmitForm = async (e) => {
        e.preventDefault();
        if(!description.trim()) return;
        try {
            setError(null);
            const res = await axios.post("http://localhost:5000/todos", {
                description, completed: false
            });
            setTodos([...todos,res.data]);
            setDescription("");
        } catch (e) {
            console.error(e.message);
            setError("Failed to add todo. Please try again later.");
        }
    };

    const saveEdit = async (id) => {
        try {
            setError(null);

            const currentTodo = todos.find((todo) => todo.todo_id === id);
            const trimmedText = editedText.trim();

            if (currentTodo.description === trimmedText) {
                setEditingTodo(null);
                setEditedText("");
                return;
            }

            await axios.put(`http://localhost:5000/todos/${id}`, {
                description: trimmedText,
            });
            setEditingTodo(null);
            setEditedText("");
            setTodos(todos.map((todo) => todo.todo_id === id ? {...todo, description: trimmedText} : todo));
        } catch (e) {
            console.error(e.message);
            setError("Failed to update todo. Please try again later.");
        }
    };

    const deleteTodo = async (id) => {
        try {
            setError(null);
            await axios.delete(`http://localhost:5000/todos/${id}`);
            setTodos(todos.filter((todo) => todo.todo_id !== id));
        } catch(e) {
            console.error(e.message);
            setError("Failed to delete todo. Please try again later.");
        }
    };

    const toggleCompleted = async (id) => {
        try {
            setError(null);
            const todo = todos.find((todo) => todo.todo_id === id);
            await axios.put(`http://localhost:5000/todos/${id}`, {
                description: todo.description,
                completed: !todo.completed,
            });
            setTodos(todos.map((todo) => (todo.todo_id === id ? { ...todo,
                completed: !todo.completed} : todo)));
        }catch (e) {
            console.error(e.message);
            setError("Failed to update todo. Please try again later.");
        }
    }

    const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

    // classes that change with theme
    const outerBg = isDark ? "bg-gray-900" : "bg-gray-100";
    const cardBg = isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800";
    const inputBg = isDark ? "bg-gray-700 placeholder-gray-300 text-gray-100" : "bg-white placeholder-gray-400 text-gray-700";
    const errorBg = isDark ? "bg-red-200 text-red-800" : "bg-red-100 text-red-700";
    const toggleBtn = isDark
        ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
        : "bg-white text-yellow-500 hover:bg-gray-100";

    return (
        <div className={`min-h-screen flex justify-center items-center p-4 ${outerBg}`}>
            <div className={`relative ${cardBg} rounded-2xl shadow-xl w-full max-w-lg p-8`}>
                <div className="absolute top-4 right-4">
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className={`p-2 rounded-full focus:outline-none transition-shadow shadow-sm ${toggleBtn}`}
                    >
                        {isDark ? <FiSun size={18}/> : <FiMoon size={18}/>}
                    </button>
                </div>

                <h1 className="text-4xl font-bold mb-8">PERN TODO APP</h1>
                {error && <div className={`${errorBg} p-3 rounded mb-4`}>{error}</div>}
                <form onSubmit={onSubmitForm} className="flex items-center gap-2 shadow-sm border p-2 rounded-lg mb-6 ">
                    <input
                        className={`flex-1 outline-none px-3 py-2 ${inputBg}`}
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What needs to be done?"
                        required
                    />
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium cursor-pointer ">Add Task</button>
                </form>
                <div>
                    {loading ? (
                        <div>
                            <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>Loading tasks...</p>
                        </div>
                    ) : todos.length === 0 ? (
                        <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>No tasks available. Add a new task!</p>
                    ) : (
                        <div className="flex flex-col gap-y-4">
                            {todos.map((todo) => (
                                <div key={todo.todo_id} className="pb-4">
                                    {editingTodo === todo.todo_id ? (
                                        <div className="flex items-center gap-x-3">
                                            <input className={`flex-1 p-3 border rounded-lg border-gray-200 outline-none focus:ring-2 focus:ring-blue-300 shadow-inner ${isDark ? "bg-gray-700 text-gray-100 border-gray-600" : "text-gray-700"}`} type="text" value={editedText} onChange={(e) => setEditedText(e.target.value)} />
                                            <div>
                                                <button onClick={() => saveEdit(todo.todo_id)} className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2 mt-2 hover:bg-green-600 duration-200"><MdOutlineDone /></button>
                                                <button  onClick={() => setEditingTodo(null)} className="px-4 py-2 bg-gray-500 text-white rounded-lg mt-2 hover:bg-gray-600 duration-200"><IoClose/></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-x-4 overflow-hidden">
                                                <button onClick={() => toggleCompleted(todo.todo_id)} className={` flex-shrink-0 h-6 w-6 border-2 rounded-full flex items-center justify-center ${todo.completed ? "bg-green-500 border-green-500 text-white" : isDark ? "border-gray-500 hover:border-yellow-400" : "border-gray-300 hover:border-blue-400"}`}>
                                                    {todo.completed && <MdOutlineDone size={16}/>}
                                                </button>
                                                <span className={isDark ? "text-gray-100" : ""}>{todo.description}</span>
                                            </div>
                                            <div className="flex gap-x-2">
                                                <button onClick={() => {setEditingTodo(todo.todo_id); setEditedText(todo.description);}} className="p-2 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-50 duration-200"><MdModeEditOutline/></button>
                                                <button onClick={() => deleteTodo(todo.todo_id)} className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 duration-200"><FaTrash/></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
