from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, disconnect
from uuid import uuid4
from enum import Enum
from json import loads as dictise
from math import inf
from copy import deepcopy

import os

# Player Types
class PlayerType(Enum):
    _=-1
    X=0,
    O=1,

# Game Types
class GameType(Enum):
    AI=0, 
    HUMAN=1

# Who's turn 
class Turn(Enum):
    OTHER=0,
    THIS=1

# Tic Tac Toe Game 
class TicTacToeTreeNode(object):
    def __init__(self, value):
        self.value = value
        self.child : Iterator[TicTacToeTreeNode] = []
    
    def appendChild(self, childNode) -> None:
        child = self.child
        child.append(childNode)

    def getValue(self) -> any:
        return self.value

    def getChild(self, index : int):
        return self.child[index]
    
    def getChildLength(self) -> int:
        return len(self.child)
    
    # For debugging purpose
    def __str__(self):
        value = self.value
        return "{}".format(value)

class TicTacToeTree(object):    
    @staticmethod
    def initialise() -> TicTacToeTreeNode:
        returnSet = []
        for i in range(3):
            set = []
            for j in range(3):
                set.append(PlayerType._)
            returnSet.append(set)
    
        startState = {
            "state" : returnSet,
            "minmax" : 0
        }
        return TicTacToeTreeNode(startState)
    
    @staticmethod
    def minimax(currentNode : TicTacToeTreeNode, depth : int, maximiser: bool):
        if currentNode.getChildLength() is 0:
            return 0, None, depth
        
        nodeValue = currentNode.getValue()["minmax"]

        if nodeValue is not 0:
            return nodeValue, currentNode, depth
        
        selectedNode = currentNode.getChild(0)
        if maximiser:
            maxNode = currentNode.getChild(0)
            totalChildren = currentNode.getChildLength()
            maxValue = -inf # Initially negative
            for index in range(totalChildren):
                selectedNode = currentNode.getChild(index)
                value, nextNode, terminalDepth = TicTacToeTree.minimax(selectedNode, depth + 1, \
                    False)
                if value > maxValue:
                    maxValue = value
                    maxNode = selectedNode
            return maxValue, maxNode, depth
        
        # Now it is the minimiser's turn
        totalChildren = currentNode.getChildLength()
        minValue = inf
        minNode = currentNode.getChild(0)
        for index in range(totalChildren):
            selectedNode = currentNode.getChild(index)
            value, nextNode, terminalDepth = TicTacToeTree.minimax(selectedNode, depth + 1, \
                True)
            if value < minValue:
                minValue = value
                minNode = selectedNode
        return minValue, minNode, depth

    def __init__(self, value):
        self.root = value
        def horizontal_check(gameArray, currentPlayer : PlayerType):
            # Horizontal Check
            for row in range(3):
                horizontalValid = True
                for col in range(3):
                    if not gameArray[row][col] is currentPlayer:
                        horizontalValid = False
                if horizontalValid:
                    return True
            return False
            
        def vertical_check(gameArray, currentPlayer : PlayerType):
            # Vertical Check
            for col in range(3):
                verticalValid = True
                for row in range(3):
                    if not gameArray[row][col] is currentPlayer:
                        verticalValid = False
                if verticalValid:
                    return True
            return False

        def cross_check(gameArray, currentPlayer : PlayerType):
            leftRightValid = True
            rightLeftValid = True

            # Left to Right
            for index in range(3):
                if not gameArray[index][index] is currentPlayer:
                    leftRightValid = False
            
            # Right to Left
            for index in range(3):
                row = index
                col = 2 - row
                if not gameArray[row][col] is currentPlayer:
                    rightLeftValid = False
            
            return rightLeftValid or leftRightValid
        
        def next_turn(currentPlayer : PlayerType):
            if currentPlayer is PlayerType.O:
                return PlayerType.X
            return PlayerType.O
        
        def check_game_win(gameArray):
            playerTypes = [PlayerType.X, PlayerType.O]
            for player in playerTypes:
                if horizontal_check(gameArray, player) or \
                   vertical_check(gameArray, player) or \
                   cross_check(gameArray, player):
                   return player
            
            return PlayerType._

        def build_tree(currentTurn : PlayerType, \
            gameNode : TicTacToeTreeNode, depth : int) -> int:
            
            gameArray = gameNode.getValue()["state"]

            for i in range(3):
                for j in range(3):
                    if gameArray[i][j] is PlayerType._:
                        newArray = deepcopy(gameArray)
                        newArray[i][j] = currentTurn
                        # Node value
                        nodeValue = {
                            "state" : newArray,
                            "minmax" : 0 # Initially assumes the state is unfilled
                        }
                        # Creating new node
                        newNode = TicTacToeTreeNode(nodeValue)
                        gameNode.appendChild(newNode)
                        # Moving to the next level
                        nodeValue["minmax"] = \
                            build_tree(next_turn(currentTurn), newNode, \
                                    depth + 1)

            # Reaches here if all the places are tried 
            whoWon = check_game_win(gameArray)
            # X is maximiser
            if whoWon is PlayerType.X:
                # If the maximiser has won then return
                # a positive value
                # subtracting depth from it
                # this is to force the algorithm to choose the nearest win
                return 10 - depth
            elif whoWon is PlayerType.O:
                # If the minimiser has won then return
                # a negative value
                return -10 + depth
            # If no one has won the game
            return 0
        
        rootNode = self.root
        build_tree(PlayerType.X, rootNode, 0)
    
    def get_root(self):
        return self.root

    def find_ai_move(self, currentNode : TicTacToeTreeNode, currentDepth : int, \
        turn : PlayerType):        
        maximiser = False

        if turn is PlayerType.X:
            maximiser = True

        value, nextNode, nextDepth = TicTacToeTree.minimax(currentNode, \
            currentDepth, maximiser)
        return nextNode, nextDepth    

    def find_user_move(self, currentNode : TicTacToeTreeNode, currentDepth : int,\
        turn : PlayerType, move):
        pass

# Game Hash Table
gameTable = {}
sessionGameTable = {}
# Tree variable comes here
print("\033[1;31mBuilding Game Tree...")
rootNode = TicTacToeTree.initialise()
tree = TicTacToeTree(rootNode)
CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))
STATIC_FOLDER = os.path.join(CURRENT_DIR, "static-src", "build", "static")

app = Flask(__name__, static_folder=STATIC_FOLDER)
app.config['SECRET_KEY'] = 'f30516fe-dee2-4a46-9535-72aedfb56ae8'
socketio = SocketIO(app)

def insert_game(element, player, playerType : PlayerType, gameType : GameType):
    # Converting to string
    element = str(element)
    player = str(player)

    # Turn logic
    turn = Turn.THIS if gameType is GameType.AI and playerType is PlayerType.O else \
                Turn.OTHER

    gameTable[element] = {
        "player" : {
            player : playerType,
        },
        "board" : {
            "node" : tree.get_root(),
            "depth" : 0
        },
        "type" : gameType,
        "ended" : False,
        "turn" : turn 
    }

    # If AI then record it's Player Type
    if gameType is GameType.AI:
        gameTable[element]["player"]["ai"] = \
            PlayerType.O if playerType is PlayerType.X else PlayerType.X
    
    return element

def game_exists(element, playerID):
    if not element in gameTable or gameTable[element]["ended"]:
        return False
    players = gameTable[element]["player"]
    return playerID in players

def clear_session_game(sessionID):
    if not sessionID in sessionGameTable:
        return False
    # Get the mapping from session ID to game ID
    gameID = sessionGameTable[sessionID]
    # Remove the value of game ID 
    del gameTable[gameID]
    # Remove the record of session ID
    del sessionGameTable[sessionID]
    return True

def clear_game(gameID):
    if not (gameID in gameTable):
        return False
    del gameTable[gameID]
    return True

def handle_internal_error(error):
    return error, 500

def handle_success(content):
    return jsonify(content), 200

def set_sid(gameID, playerID, sessionID):
    if not playerID in gameTable[gameID]["player"]:
        return False
    # Mapping player id to session id
    gameTable[gameID]["player"]["sid"] = sessionID
    # Mapping session id to game id
    sessionGameTable[sessionID] = gameID
    return True

def temp_string(value):
    string = "X"
    if value is PlayerType.O:
        string = "O"
    elif value is PlayerType._:
        string = "*"
    return string

def print_game(gameArray):
    for rows in range(0, 3):
        gameRow = gameArray[rows]
        first = temp_string(gameRow[0])
        second = temp_string(gameRow[1])
        third = temp_string(gameRow[2])
        print("{} | {} | {}".format(first, second, third))

def set_next_move(game):
    currentNode = game["board"]["node"]
    currentDepth = game["board"]["depth"]
    playerType = game["player"]["ai"]

    nextNode, nextDepth = tree.find_ai_move(currentNode, currentDepth, \
        playerType)

    # Set the nextNode and depth
    game["board"]["node"] = nextNode
    game["board"]["depth"] = nextDepth

    # Get the board state
    boardState = nextNode.getValue()["state"]

    return boardState


def board_json(boardState):
    returnArray = []
    for rows in range(3):
        colsArray = []
        for cols in range(3):
            playerType = boardState[rows][cols] 
            if playerType is PlayerType.O:
                colsArray.append(1)
            elif playerType is PlayerType.X:
                colsArray.append(0)
            else:
                colsArray.append(-1)
        returnArray.append(colsArray)
    return returnArray

def game_logic(sid):
    if not sid in sessionGameTable:
        return False

    gid = sessionGameTable[sid]
    game = gameTable[gid]
    currentTurn = game["turn"]
    # If it is AI's turn make decision and broadcast
    if currentTurn is Turn.THIS: 
        boardState = set_next_move(game)
        boardJSON = board_json(boardState)
        # Emit the move
        socketio.emit("player::move", {\
            "responseMove" : True,
            "boardState" : boardJSON # Board placement
        }, room=sid)
        # Setting current turn
        game["turn"] = Turn.OTHER
        # Going further
        game_logic(sid)
    # Else broadcast to other human player to make a move
    else:
        socketio.emit("player::move", {
            "requestMove" : True
        }, room=sid)

    return True

@app.route("/", methods=["GET"])
def serve_react_content():
    return send_from_directory("./static-src/build/", "index.html")

@app.route("/api/join", methods=["GET"])
def join():
    gameID = request.args.get("gid")
    playerName = request.args.get("name")
    try:
        assert(gameID is not None and playerName is not None)
    except AssertionError:
        return handle_internal_error("Game ID and your name must be provided")
    return handle_success({})

@app.route("/api/game/ai", methods=["POST"])
def game_ai():  
    params = request.get_json()
    try:
        if params is not None:
            data = params["data"]
            if data is not None:
                data = dictise(data)
            else:
                raise "Invalid data given"
        else:
            raise "Invalid data given"
        # Setting game ID and player ID
        gameID = uuid4()
        playerID = uuid4()
        playerType = data["playerType"]
        assert(playerType is 0 or playerType is 1)
        # Convert the player type to game enum
        gamePlayerType = PlayerType.X if playerType is 0 else PlayerType.O
        # Create a new game into table
        insert_game(gameID, playerID, gamePlayerType, GameType.AI)
    except AssertionError:
        return jsonify({"valid" : False, "msg" : "Invalid player type given"}), 401
    except:
        return jsonify({"valid" : False, "msg": "Invalid data given"}), 401

    return handle_success({
        "valid" : True,
        "ai" : True,
        "gid" : str(gameID),
        "pid" : str(playerID),
        "playerType" : playerType
    })

@app.route("/api/game/human", methods=["GET"])
def game_human():
    playerName = request.args.get("name")
    playerID = uuid4()
    gameID = uuid4()
    try:
        assert(playerName is not None and gameID is not playerID)
    except AssertionError:
        return handle_internal_error("Player Name must be valid")

    gameIdentification = insert_game(gameID, {
        "pid" : playerID,
        "name" : playerName
    }, GameType.HUMAN)

    return handle_success({
        "gid" : gameIdentification
        })


@socketio.on("disconnect")
def disconnect_handler():
    sessID = request.sid
    clear_game(sessID)
    print("Disconnect handler triggered for {}".format(sessID))


@socketio.on("player::move")
def player_move(message):
    try:
        sid = request.sid
        
        assert(sid in sessionGameTable)

        gid = sessionGameTable[sid]
        gameID = message["gid"]
        playerID = message["pid"]
        # whether given credentials are proper
        assert(game_exists(gameID, playerID) and gid == gameID)
        # If valid emit player::move to client
        if True:
            socketio.emit("player::move", {
                "updateMove" : True,
                "boardState" : [1, 1]
            }, room=sid)
        # Else ignore
    except:
        disconnect(sid=request.sid)
        return None
        
@socketio.on("request::ai")
def handle_request_ai(message):
    gameID = message["game"]
    playerID = message["player"]
    playerType = message["playerType"]
    sessID = request.sid

    if game_exists(gameID, playerID):
        # Respond with success
        set_sid(gameID, playerID, sessID)
        game_logic(sessID)
    else:
        # Disconnect the client
        print("Disconnected user due to incorrect details")
        disconnect(sessID)

if __name__ == '__main__':
    # Build game tree
    print("\033[0;32mDone Building, starting server...\033[1;30m")
    # Start the server
    socketio.run(app)