// Core
import React, { Component } from 'react';

//Components
import Spinner from "../Spinner";
import Task from "../Task";

// Instruments
import Styles from './styles.m.css';
import { api } from '../../REST'; // ! Импорт модуля API должен иметь именно такой вид (import { api } from '../../REST')
import Checkbox from "../../theme/assets/Checkbox";
import { socket } from '../../socket/init';
import { MAIN_URL } from '../../REST/config';
import FlipMove from 'react-flip-move';


export default class Scheduler extends Component {
    state = {
        tasks:           [],
        isTasksFetching: false,
        newTaskMessage:  '',
        tasksFilter:     '',
    }

    componentDidMount () {
        this._fetchTasksAsync();

        socket.emit('join', MAIN_URL);

        socket.on('create', (postJSON) => {
            const { data: createTask } = JSON.parse(postJSON);

            this.setState((prevState) => ({
                tasks: [createTask, ...prevState.tasks],
            }));
        });
    }

    _setTasksFetchingState = (state) => {
        this.setState({
            isTasksFetching: state,
        });
    };

    _fetchTasksAsync = async () => {
        try {
            this._setTasksFetchingState(true);

            const tasks = await api.fetchTasks();

            this.setState({
                tasks,
                isTasksFetching: false,
            });

            this._setTasksFetchingState(false);
        } catch (error) {
            console.log(error.message);
            this._setTasksFetchingState(false);
        }
    };

    _createTaskAsync = async (event) => {
        try {
            const { newTaskMessage } = this.state;

            event.preventDefault();
            if (!newTaskMessage) {
                return null;
            }
            this._setTasksFetchingState(true);

            const task = await api.createTask(newTaskMessage);

            this.setState({ newTaskMessage: '' });

            this.setState((prevState) => ({
                tasks: [task, ...prevState.tasks],
                isTasksFetching: false,
            }));

            this._setTasksFetchingState(false);
        } catch (error) {
            console.log(error.message);
            this._setTasksFetchingState(false);
        }
    };

    _removeTaskAsync = async (taskId) => {
        try {
            this._setTasksFetchingState(true);

            await api.removeTask(taskId);

            this.setState(({ tasks }) => ({
                tasks:           tasks.filter((task) => task.id !== taskId),
                isTasksFetching: false,
            }));

            this._setTasksFetchingState(false);
        } catch (error) {
            console.log(error.message);
            this._setTasksFetchingState(false);
        }
    };

    _updateNewTaskMessage = (event) => {
        const { value: newTaskMessage } = event.target;
        this.setState({ newTaskMessage });
    };

    _updateTaskAsync = async (id, message, completed, favorite) => {
        try {
            this._setTasksFetchingState(true);

            const updatedTask = await api.updateTask(id, message, completed, favorite);

            this._mergeWithNewTasks([updatedTask]);

            this._setTasksFetchingState(false);
        } catch (error) {
            console.log(error.message);
            this._setTasksFetchingState(false);
        }
    };

    _mergeWithNewTasks = (tasks) => {
        this.setState(({tasks: prevTasks}) => ({
            tasks: [
                ...prevTasks.filter(
                    (prevTask) => !tasks.some((task) => task.id === prevTask.id)
                ),
                ...tasks
            ]
        }));
    };

    _completeAllTasksAsync = async () => {
        try {
            this._setTasksFetchingState(true);

            const { tasks } = this.state;
            const completedTasks = tasks
                .filter(({ completed }) => !completed)
                .map((task) => ({ ...task, completed: true }));

            if (tasks.every((task) => task.completed === true)) {
                return null;
            }

            const updatedTasks = await api.completeAllTasks(completedTasks);

            this._mergeWithNewTasks(updatedTasks);

            this._setTasksFetchingState(false);
        } catch (error) {
            console.log(error.message);
            this._setTasksFetchingState(false);
        }
    };

    _updateTasksFilter = async (event) => {
        try {
            this._setTasksFetchingState(true);

            const { value: tasksFilter } = event.target;

            this.setState({ tasksFilter: tasksFilter.toLocaleLowerCase() });

            this._setTasksFetchingState(false);
        } catch (error) {
            console.log(error.message);
            this._setTasksFetchingState(false);
        }
    };

    _getAllCompleted = () => {
        const { tasks } = this.state;
        const allTaskCompleted = tasks.every((task) => task.completed === true);

        return allTaskCompleted;
    };

    render () {

        const { tasks, isTasksFetching, newTaskMessage, tasksFilter } = this.state;
        const weight = (task) => 2 * Number(task.completed) - Number(task.favorite);
        const created = (task) => new Date(task.created).getTime();
        const messageIncludes = (task) => task.includes(tasksFilter);

        const tasksJSX = tasks
            .filter((task) => messageIncludes(task.message.toLocaleLowerCase()))
            .sort((a, b) => created(b) - created(a))
            .sort((a, b) => weight(a) - weight(b))
            .map((task) => (
                <Task
                    getAllCompleted = { this._getAllCompleted }
                    key = { task.id }
                    message = { newTaskMessage }
                    removeTask = { this._removeTaskAsync }
                    updateTask = { this._updateTaskAsync }
                    { ...task }
                />
        ));

        return (
            <section className = { Styles.scheduler }>
                <main>
                    <Spinner isTasksFetching = { isTasksFetching } />
                    <header>
                        <h1>Планировщик задач</h1>
                        <input
                            type = 'search'
                            value = { tasksFilter }
                            onChange = { this._updateTasksFilter }
                        />
                    </header>
                    <section>
                        <form onSubmit = { this._createTaskAsync }>
                            <input
                                maxLength = '50'
                                placeholder = 'Описaние моей новой задачи'
                                type = 'text'
                                value = { newTaskMessage }
                                onChange = { this._updateNewTaskMessage }
                            />
                            <button>Добавить задачу</button>
                        </form>
                        <ul>
                            <FlipMove>
                                { tasksJSX }
                            </FlipMove>
                        </ul>
                    </section>
                    <footer>
                        <Checkbox
                            inlineBlock
                            checked = { tasks.every((task) => task.completed === true) }
                            className = { Styles.toogleTaskCompletedState }
                            color1 = '#363636'
                            color2 = '#fff'
                            onClick = { this._completeAllTasksAsync }
                        />
                        <span className = { Styles.completeAllTasks }>Все задачи выполнены</span>
                    </footer>
                </main>
            </section>
        );
    }
}
