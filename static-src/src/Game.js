import React from "react";
import "./css/game.css";
import io from "socket.io-client";
import axios from "axios";
import {Link, HashRouter as Router, Route} from "react-router-dom";
import {library} from "@fortawesome/fontawesome-svg-core";
import {faUser, faRobot} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

// Adding icons
library.add(faUser, faRobot);

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
        switch (this.state.move) {
            case this.MOVE_TYPE._:
                return <></>;
            case this.MOVE_TYPE.O:
                value = "O";
            break;
            case this.MOVE_TYPE.X:
                value = "X";
            break;
        }
        return (
            <div className="move">{value}</div>
        )
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        // Properties
        // Enum MOVE
        this.MOVE_TYPE = {
            _ : -1,
            X : 0,
            O : 1
        };
        // Enum PLAYER
        this.TURN = {
            OTHER : 0,
            THIS : 1
        }

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
                won : {
                    status : false,
                    result : null
                },
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
            
        }
        // Start game process by invoking socket connection with credentials
        this.socket = io();
        this.socket.emit("request::ai", {            
            game : this.gid,
            player : this.pid,
            playerType : this.playerType
        });

        this.socket.on("player::move", this.onGameMove);
        this.socket.on("game::end", this.onGameEnd);

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
                
            this.socket.emit("player::move", {
                "myMove" : [row, col],
                "pid" : this.pid,
                "gid" : this.gid
            });
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
            console.log(data.deltaState)
        }
    }

    // Indicates game end
    onGameEnd() {

    }

    updateBoard(newState) {
        let moveArray = this.possibleMoveArray,
            boardState = Object.assign({}, this.state.boardState);
                
        newState.forEach((row, rowIndex) => {
            row.forEach((positionMove, colIndex) => {
                if (positionMove != this.MOVE_TYPE._) {
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
        )
    }
}

class GameOption extends React.Component {
    constructor(props) {
        super(props);
        // Bindings
        this.humanGame = this.humanGame.bind(this);
        this.aiGame = this.aiGame.bind(this);
        // Information about type
        this.information = {
            "ai" : {
                label : "ROBO",
                icon : "robot",
                handle : this.aiGame
            },
            "human" : {
                label : "HUMAN",
                icon : "user",
                handle : this.humanGame
            }
        }
    }

    humanGame() {
        
    }

    aiGame() {
        
    }

    render() {
        const type = this.props.type;
        return (
            <div className={type} onClick={this.information[type].handle}>
                <Link to={`new/${type}`}>
                    <div className="icon">
                        <FontAwesomeIcon icon={this.information[type].icon}></FontAwesomeIcon>
                    </div>
                    <div className="label">
                        {this.information[type].label}
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
                        <GameOption type="human"></GameOption>
                        <GameOption type="ai"></GameOption>
                    </Router>
                </div>
            </div>
        )
    }
}

class FetchName extends React.Component {
    render() {
        return (
            <div>
                Enter Your Name Here
            </div>
        )
    }
}

class MainMenu extends React.Component {
    render() {
        return (
            <Router>
                <Route exact path="/">
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
                                <Link to="/join">
                                    <div className="join">
                                        JOIN GAME
                                    </div>
                                </Link>
                            </Router>
                        </div>
                    </div>
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
        if (this.x.current == target) {
            // For X player type
            this.props.onSelect(this.props.options.X);
        } else if (this.o.current == target) {
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
        this.PLAYER_TYPE = {
            X : 0,
            O : 1
        };
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
            case this.showStates.LOADING:
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