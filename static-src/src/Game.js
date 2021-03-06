import React from "react";
import "./css/game.css";
import io from "socket.io-client";
import axios from "axios";
import {Link, HashRouter as Router, Route} from "react-router-dom";
import {library} from "@fortawesome/fontawesome-svg-core";
import {faUser, faRobot, faRedoAlt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

// Adding icons
library.add(faUser, faRobot, faRedoAlt);

const WINSTATE = {
    NONE : -2,
    LOST : -1,
    DRAWN : 0,
    WON : 1
};

const TURNSTATE = {
    OTHER : 0,
    THIS : 1
}

const MOVETYPE = {
    _ : -1,
    X : 0,
    O : 1
};

const PLAYERTYPE = {
    X : 0,
    O : 1
}

class BoardLoading extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text : "LOADING"
        }
    }

    render() {
        return (
            <h1>{this.state.text}</h1>
        )
    }
}

class BoardMove extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            move : this.props.type
        }
        this.MOVE_TYPE = this.props.options;
    }

    static getDerivedStateFromProps(nextProp, currentState) {
        if (nextProp.type !== currentState.move) {
            return {
                move : nextProp.type
            };
        }

        return null;
    }

    render() {
        let value;
        let roleClass;
        switch (this.state.move) {
            default:
                return <></>;
            case this.MOVE_TYPE.O:
                value = "O";
                roleClass = "o";
            break;
            case this.MOVE_TYPE.X:
                value = "X";
                roleClass = "x";
            break;
        }
        return (
            <div className="move">
                <div className={roleClass}>
                    {value}
                </div>
            </div>
        )
    }
}

class BoardNotification extends React.Component {
    constructor(props) {
        super(props);
        this.options = this.props.options;
        this.state = {
            won : this.props.wonState
        };
    }

    refreshWindow() {
        window.location.reload();
    }

    // On props change
    static getDerivedStateFromProps(deltaProps, currentState) {
        if (deltaProps.wonState !== currentState.won) {
            return {
                won : deltaProps.wonState
            }            
        }

        return null;
    }

    render() {
        let notification;
        let notificationClassName;

        switch(this.state.won) {
            case this.options.WON:
                notification = "GAME WON";
                notificationClassName = "visible";
                break;
            case this.options.LOST:
                notification = "GAME LOST";
                notificationClassName = "visible";
                break;
            case this.options.DRAWN:
                notification = "GAME DRAWN";
                notificationClassName = "visible";
                break;
            default:
                break;
        }
        return (
            <div id={notificationClassName} className="board-notification">
                <h1>{ notification }</h1>
                <button className={notificationClassName} onClick={this.refreshWindow}>
                    <FontAwesomeIcon icon={"redo-alt"}></FontAwesomeIcon>
                </button>
            </div>
        )
    }

}

class TurnNotification extends React.Component {
    render() {
        const { turn, status } = this.props.gameState;
        if (turn === null || status !== WINSTATE.NONE) {
            return <div></div>;
        }

        const notifications = ["Waiting for their move...", "Your Turn"];        

        return (
            <div>{ notifications[turn] }</div>
        );
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        // Properties
        // Enum MOVE
        this.MOVE_TYPE = MOVETYPE;
        // Enum Turns
        this.TURN = TURNSTATE;

        // Enums
        this.WON_STATE = WINSTATE;

        this.possibleMoves = {
            "f" : 0,
            "s" : 1,
            "t" : 2
        }

        this.possibleMoveArray = ["f", "s", "t"];

        this.state = {
            boardState : {
                ff : this.MOVE_TYPE._,
                fs : this.MOVE_TYPE._,
                ft : this.MOVE_TYPE._,
                sf : this.MOVE_TYPE._,
                ss : this.MOVE_TYPE._,
                st : this.MOVE_TYPE._,
                tf : this.MOVE_TYPE._,
                ts : this.MOVE_TYPE._,
                tt : this.MOVE_TYPE._
            },
            gameStatus : {
                // defaults to no connection but sets to true if web-socket
                // is connected
                connected : false,
                status : this.WON_STATE.NONE,
                turn : null,
            }
        }

        // Bindings
        this.onUserMove = this.onUserMove.bind(this);
        this.onGameMove = this.onGameMove.bind(this);
        this.onGameEnd = this.onGameEnd.bind(this);
        this.updateBoard = this.updateBoard.bind(this);
    }

    async componentDidMount() {
        // Send information to the server about this game
        // Server responds pid and gid
        try {

            let response = (await (axios.post("/api/game/ai", {
                data : JSON.stringify({
                    "playerType" : this.props.playerType
                })
            }))).data;

            if(response.ai && response.valid) {
                // Confirmation that right details are sent
                // Set player id and game id
                this.pid = response.pid;
                this.gid = response.gid;
                this.playerType = response.playerType;
            }
            
        } catch (error) {
            // Things to do if there are issues while fetching details
            return ;
        } finally {

            // Start game process by invoking socket connection with credentials
            this.socket = io();
            this.socket.emit("request::ai", {            
                game : this.gid,
                player : this.pid,
                playerType : this.playerType
            });
            
            // Here set the state for the turn
            // If the player type is X then it is their first move
            if (this.playerType === PLAYERTYPE.O) {
                let gameState = Object.assign({}, this.state);
                let { gameStatus } = gameState;
                gameStatus.turn = TURNSTATE.OTHER;
                this.setState(gameState);
            }
            // Listeners
            this.socket.on("player::move", this.onGameMove);
            this.socket.on("game::end", this.onGameEnd);
        
        }
    }

    onUserMove(event) {
        let element = event.currentTarget;
        let index = element.getAttribute("data-location");
        let rowIndex = index[0],
            colIndex = index[1];

        if (colIndex in this.possibleMoves && rowIndex in this.possibleMoves && 
                this.state.boardState[index] === this.MOVE_TYPE._ &&
                this.state.gameStatus.turn === this.TURN.THIS) {
            // Logic to register user move
            let row = this.possibleMoves[rowIndex],
                col = this.possibleMoves[colIndex];
            let nextState = Object.assign({}, this.state);
            this.socket.emit("player::move", {
                "myMove" : [row, col],
                "pid" : this.pid,
                "gid" : this.gid
            });
            // Set the game status to other
            nextState.gameStatus.turn = this.TURN.OTHER;
            this.setState(nextState);
        }
    }

    onGameMove(data) {
        if (data.requestMove) {
            let gameStatus = Object.assign({}, this.state.gameStatus);
            gameStatus.turn = this.TURN.THIS;
            this.setState({
                gameStatus
            });
        } else if (data.responseMove) {
            let boardState = data.boardState;
            this.updateBoard(boardState);

        } else if (data.updateMove) {
            let boardState = data.boardState;
            this.updateBoard(boardState);
        }
    }

    // Indicates game end
    onGameEnd(data) {
        // Copy the state
        let gameStatus = Object.assign({}, this.state.gameStatus);
        // Evaluate win state
        if (data.whoWon === this.MOVE_TYPE._) {
            // Means it is a draw
            gameStatus.status = this.WON_STATE.DRAWN;
        } else if (data.whoWon !== this.playerType) {
            // Then it is a lost game
            gameStatus.status = this.WON_STATE.LOST;
        } else {
            // You Won
            gameStatus.status = this.WON_STATE.WON;
        }

        this.setState({
            gameStatus
        });

    }

    updateBoard(newState) {
        let moveArray = this.possibleMoveArray,
            boardState = Object.assign({}, this.state.boardState);
                
        newState.forEach((row, rowIndex) => {
            row.forEach((positionMove, colIndex) => {
                if (positionMove !==this.MOVE_TYPE._) {
                    let firstIndex = moveArray[rowIndex],
                        secondIndex = moveArray[colIndex],
                        index = firstIndex + secondIndex;
                    boardState[index] = positionMove;            
                }
            });
        });
        // Setting board state
        this.setState({
            boardState
        });
    }

    render() {
        return (
            <div className="board-wrapper">
                <BoardNotification options={this.WON_STATE}
                        wonState={this.state.gameStatus.status}>
                </BoardNotification>
                <TurnNotification gameState={this.state.gameStatus}></TurnNotification>
                <div className="board">
                    <div className="row">
                        <div className="col" data-location={"ff"} onClick={this.onUserMove}>
                            <BoardMove options={this.MOVE_TYPE} 
                                type={this.state.boardState.ff}></BoardMove>   
                        </div>
                        <div className="col middle" data-location={"fs"} onClick={this.onUserMove}>
                            <BoardMove options={this.MOVE_TYPE} 
                                type={this.state.boardState.fs}></BoardMove>
                        </div>
                        <div className="col" data-location={"ft"} onClick={this.onUserMove}>
                            <BoardMove options={this.MOVE_TYPE} 
                                type={this.state.boardState.ft}></BoardMove>
                        </div>
                    </div>
                    <div className="row middle">
                        <div className="col" data-location={"sf"} onClick={this.onUserMove}>
                            <BoardMove options={this.MOVE_TYPE} 
                                type={this.state.boardState.sf}></BoardMove>
                        </div>
                        <div className="col middle" data-location={"ss"} onClick={this.onUserMove}>
                            <BoardMove options={this.MOVE_TYPE} 
                                type={this.state.boardState.ss}></BoardMove>
                        </div>
                        <div className="col" data-location={"st"} onClick={this.onUserMove}>
                            <BoardMove options={this.MOVE_TYPE} 
                                type={this.state.boardState.st}></BoardMove>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col" data-location={"tf"} onClick={this.onUserMove}>
                            <BoardMove options={this.MOVE_TYPE} 
                                type={this.state.boardState.tf}></BoardMove>
                        </div>
                        <div className="col middle" data-location={"ts"} onClick={this.onUserMove}>
                            <BoardMove options={this.MOVE_TYPE} 
                                type={this.state.boardState.ts}></BoardMove>
                        </div>
                        <div className="col" data-location={"tt"} onClick={this.onUserMove}>
                            <BoardMove options={this.MOVE_TYPE} 
                                type={this.state.boardState.tt}></BoardMove>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class GameOption extends React.Component {
    constructor(props) {
        super(props);
        // Bindings
        // Information about type
        this.information = {
            "ai" : {
                label : "ROBO",
                icon : "robot"
            },
            "human" : {
                label : "HUMAN",
                icon : "user"
            }
        }
    }

    render() {
        const { type, disabled } = this.props;
        const wrapperClass = [type];
        let subLabel = null;

        if (disabled) {
            subLabel = <><br /> <div>(Coming Soon)</div></>;
            wrapperClass.push("disabled");
        }

        return (
            <div className={wrapperClass.join(" ")}>
                <Link to={`new/${type}`}>
                    <div className="icon">
                        <FontAwesomeIcon icon={this.information[type].icon}></FontAwesomeIcon>
                    </div>
                    <div className="label">
                        {this.information[type].label}
                        { subLabel }
                    </div>
                    </Link>
            </div>
        )
    }
}

class GameOptionMenu extends React.Component {
    render() {
        return (
            <div className="gameDetails">
                <div className="title">
                    <h1>AGAINST</h1>
                </div>
                <div className="options">
                    <Router>
                        <GameOption type="human" disabled></GameOption>
                        <GameOption type="ai"></GameOption>
                    </Router>
                </div>
            </div>
        )
    }
}

class FetchName extends React.Component {
    constructor(props) {
        super(props);
        this.input = React.createRef();
        // Binding
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.checkContent = this.checkContent.bind(this);
        this.setInputFocus = this.setInputFocus.bind(this);
        this.onSuccess = this.onSuccess.bind(this);
        // State
        this.state = {
            onActive : false,
            hasContent: false,
            onSubmit: false
        };
    }

    setInputFocus() {
        // Trigger click event
        this.input.current.focus();
    }

    checkContent() {
        let value = this.input.current.value;
        this.setState({
            hasContent : value.length > 0
        });
    }

    onFocus() {
        this.setState({
            onActive : true
        });
    }

    onBlur() {
        if (!this.input.current.value) {
            this.setState({
                onActive : false
            })
        }
        
    }

    onSuccess() {
        let name = this.input.current;
        if (!name)
            return ;
        
        let value = name.value;

        if (value) {
            this.setState({
                onSubmit : true
            });
            // Set the context containing the name and game id
        }

    }

    render() {
        return (
            <div className="about-you-wrapper">
                <div className="name-dialog-title">
                    <h1>DETAILS</h1>
                </div>
                <div className="name-dialog-wrapper">
                    <div className="name-dialog" onClick={this.setInputFocus} data-on-focus={this.state.onActive}>
                        <div className="name-dialog-input">
                            <input disabled={this.state.onSubmit} type="text" ref={this.input} onBlur={this.onBlur} 
                                    onFocus={this.onFocus} onChange={this.checkContent} />
                        </div>
                        <div data-on-focus={this.state.onActive} className="name-dialog-label"></div>
                    </div>
                    <div className="name-dialog-submit" onClick={this.onSuccess} data-on-success={this.state.hasContent} >
                        Let's Play!
                    </div>
                </div>
            </div>
        )
    }
}

class GameTitle extends React.Component {
    render() {
        return (
            <div className="menu">
                <div className="title">
                    <h1>Tic Tac Toe</h1>
                </div>
                <div className="options">
                    <Router>
                        <Link to="new">
                            <div className="new">
                                NEW GAME
                            </div>
                        </Link>
                        <div className="join disabled">
                            <strike>JOIN GAME</strike>
                        </div>
                    </Router>
                </div>
            </div>
        );
    }
}

class MainMenu extends React.Component {
    render() {
        return (
            <Router>
                <Route exact path="/join/:gid">
                </Route>
                <Route exact path="/">
                    <GameTitle></GameTitle>
                </Route>
                <Route exact path="/new">
                    <GameOptionMenu></GameOptionMenu>   
                </Route>
                <Route exact path="/new/human">
                    <Game></Game>
                </Route>
                <Route exact path="/new/ai">
                    <Game ai></Game>
                </Route>
            </Router>
        )
    }
}


class RoleSelect extends React.Component {
    constructor(props) {
        super(props);
        // Binding
        this.onSelect = this.onSelect.bind(this);
        // References
        this.x = React.createRef();
        this.o = React.createRef();
    }

    onSelect(event) {
        let target = event.currentTarget;
        if (this.x.current === target) {
            // For X player type
            this.props.onSelect(this.props.options.X);
        } else if (this.o.current === target) {
            // For O player type
            this.props.onSelect(this.props.options.O);
        }
    }

    render() {
        return (
            <div className="role-select">
                <div className="title">
                    <h1>PLAYER TYPE</h1>
                </div>
                <div className="tiles">
                    <div className="roles x" ref={this.x} onClick={this.onSelect}>X</div>
                    <div className="roles o" ref={this.o} onClick={this.onSelect}>O</div>
                </div>
            </div>
        )
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.showStates = {
            LOADING : 0,
            ROLESELECT : 1,
            HUMANNAME : 2,
            GAMEINIT : 3
        }
        this.state = {
            SHOW_STATE : this.showStates.LOADING,
        };
        // Player type enum
        this.PLAYER_TYPE = PLAYERTYPE;
        this.playerType = null;
        // Bindings
        this.onRoleSelect = this.onRoleSelect.bind(this);
    }

    componentDidMount() {
        if (this.props.ai) {
            // If AI then no need for name and invitation code
            this.setState({
                SHOW_STATE : this.showStates.ROLESELECT
            })
        } else {
            // Else if human the other person might need the 
            // this person's name and invitation code
            this.setState({
                SHOW_STATE : this.showStates.HUMANNAME
            })
        }
    }

    async onRoleSelect(type) {
        if (this.PLAYER_TYPE.X === type || this.PLAYER_TYPE.O === type) {
            this.playerType = type;
            this.setState({
                SHOW_STATE : this.showStates.GAMEINIT
            })
        }
    }

    render() {
        let content;
        switch (this.state.SHOW_STATE) {
            default:
                content = <BoardLoading></BoardLoading>;
                break;
            case this.showStates.ROLESELECT:
                content = <RoleSelect onSelect={this.onRoleSelect} options={this.PLAYER_TYPE}></RoleSelect>;
                break;
            case this.showStates.GAMEINIT:
                content = <Board ai={this.props.ai} playerType={this.playerType} options={this.PLAYER_TYPE} ></Board>;
                break;
            case this.showStates.HUMANNAME:
                content = <FetchName></FetchName>;
                break;
        }
        return content;
    }
}

class GameRoot extends React.Component {
    render() {
        return (
            <MainMenu></MainMenu>
        )
    }
}

export default GameRoot;