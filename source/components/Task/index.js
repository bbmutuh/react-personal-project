// Core
import React, { PureComponent } from 'react';

// Instruments
import Styles from './styles.m.css';
import Checkbox from "../../theme/assets/Checkbox";
import Star from "../../theme/assets/Star";
import Edit from "../../theme/assets/Edit";
import Remove from "../../theme/assets/Remove";

export default class Task extends PureComponent {
    state = {
        isDisabled: 'disabled',
        newMessage: this.props.message,
    }

    _getTaskShape = ({
        id = this.props.id,
        completed = this.props.completed,
        favorite = this.props.favorite,
        message = this.props.message,
    }) => ({
        id,
        completed,
        favorite,
        message,
    });

    _updateTaskMessageOnClick = () => {
        const { id, updateTask, completed, favorite } = this.props;
        const { isDisabled, newMessage } = this.state;

        this.setState({ isDisabled: isDisabled === 'disabled' ? false : 'disabled' });

        if (isDisabled !== 'disabled') {
            updateTask(id, newMessage, completed, favorite);
        }
    };

    _toggleTaskFavoriteState = () => {
        const { id, updateTask, completed, favorite } = this.props;
        const { newMessage } = this.state;

        updateTask(id, newMessage, completed, !favorite);
    };

    _toggleTaskCompletedState = () => {
        const { id, updateTask, completed, favorite, getAllCompleted } = this.props;
        const { newMessage } = this.state;

        updateTask(id, newMessage, !completed, favorite);

        getAllCompleted();
    };

    _updateInputText = (event) => {
        const { value: newMessage } = event.target;
        this.setState({ newMessage });
    };

    _updateTaskMessageOnKeyDown = (event) => {
        const { id, updateTask, completed, favorite } = this.props;
        const { isDisabled, newMessage } = this.state;

        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.setState({ isDisabled: isDisabled === 'disabled' ? false : 'disabled' });
            updateTask(id, newMessage, completed, favorite);
        }
    };

    _removeTask = () => {
        const { id, removeTask } = this.props;

        removeTask(id);
    };

    render () {
        const { id, completed, favorite } = this.props;
        const { isDisabled, newMessage } = this.state;

        return <li
            className = { Styles.task }
            data = { completed ? 'completed' : '' }
            id = { id }>
            <div className = { Styles.content }>
                <Checkbox
                    inlineBlock
                    checked = { completed }
                    className = { Styles.toggleTaskCompletedState }
                    color1 = '#3B8EF3'
                    color2 = '#fff'
                    onClick = { this._toggleTaskCompletedState }
                />
                <input
                    disabled = { isDisabled }
                    type = 'text'
                    value = { newMessage }
                    onChange = { this._updateInputText }
                    onKeyPress = { this._updateTaskMessageOnKeyDown }
                />
            </div>
            <div className = { Styles.actions }>
                <Star
                    inlineBlock
                    checked = { favorite }
                    className = { Styles.toggleTaskFavoriteState }
                    color1 = '#3B8EF3'
                    color2 = '#363636'
                    onClick = { this._toggleTaskFavoriteState }
                />
                <Edit
                    inlineBlock
                    checked = { !isDisabled }
                    className = { Styles.updateTaskMessageOnClick }
                    color1 = '#3B8EF3'
                    color2 = '#363636'
                    onClick = { this._updateTaskMessageOnClick }
                />
                <Remove
                    inlineBlock
                    color1 = '#3B8EF3'
                    color2 = '#363636'
                    onClick = { this._removeTask }
                />
            </div>
        </li>;
    }
}
