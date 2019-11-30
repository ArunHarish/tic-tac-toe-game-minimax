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

class Board extends React.Component {
    render() {
        return (
            <div className="board">
                <div className="row">
                    <div className="col"></div>
                    <div className="col middle"></div>
                    <div className="col"></div>
                </div>
                <div className="row middle">
                    <div className="col"></div>
                    <div className="col middle"></div>
                    <div className="col"></div>
                </div>
                <div className="row">
                    <div className="col"></div>
                    <div className="col middle"></div>
                    <div className="col"></div>
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
                    <FetchName></FetchName>
                </Route>
                <Route exact path="/new/ai">
                    <Game></Game>
                </Route>
            </Router>
        )
    }
}

class RoleSelect extends React.Component {
    render() {
        return (
            <div className="role-select">
                <div className="title">
                    <h1>ROLE SELECT</h1>
                </div>
                <div className="tiles">
                    <div>X</div>
                    <div>O</div>
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
            GAMEINIT : 2
        }
        this.state = {
            SHOW_STATE : this.showStates.LOADING 
        };
    }

    async componentDidMount() {
        let details = (await axios.get("/api/game/ai")).data;
        // Once here get the details and send it as part of initialisation
        // process
        if (details.ai) {
            let connection = io();
            let error = false;
        
            connection.emit("request::ai", {
                player : details.pid,
                game : details.gid
            });

            connection.on("request::role", () => {
                // Set the state to be asking for role
                this.setState({
                    SHOW_STATE : this.showStates.ROLESELECT
                })
            });

            connection.on("error", () => {
                error = true;    
            });

            connection.on("disconnect", () => {
                if (!error)
                    alert("Server connection has been disconnected. Game state will be removed.")
                else
                    alert("Invalid credentials provided");
                
                connection.disconnect();
            })
            
        }
        
    }

    render() {
        let content = <Board></Board>;
        switch (this.state.SHOW_STATE) {
            case this.showStates.LOADING:
                content = <BoardLoading></BoardLoading>;
                break;
            case this.showStates.ROLESELECT:
                content = <RoleSelect></RoleSelect>;
                break;
            default:
                content = <Board></Board>;
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