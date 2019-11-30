from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, disconnect
from uuid import uuid4
from enum import Enum

import os

# Player Types
class GameType(Enum):
    AI=0, 
    HUMAN=1
# Game Hash Table
gameTable = {}
sessionGameTable = {}
CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))
STATIC_FOLDER = os.path.join(CURRENT_DIR, "static-src", "build", "static")

app = Flask(__name__, static_folder=STATIC_FOLDER)
app.config['SECRET_KEY'] = 'f30516fe-dee2-4a46-9535-72aedfb56ae8'
socketio = SocketIO(app)

def insertGame(element, player, gameType : GameType):
    # Converting to string
    element = str(element)
    player = str(player)
    gameTable[element] = {
        "player" : {
            player : 0
        },
        "type" : gameType,
        "full" : False
    }

    return element

def gameExists(element, playerID):
    if not element in gameTable or gameTable[element]["full"]:
        return False
    players = gameTable[element]["player"]
    return playerID in players

def lookupGame(element, player):
    game = gameTable[element]
    if game[0] is not player:
        return None
    return game

def clearGame(sessionID):
    if not sessionID in sessionGameTable:
        return False
    # Get the mapping from session ID to game ID
    gameID = sessionGameTable[sessionID]
    # Remove the value of game ID 
    del gameTable[gameID]
    # Remove the record of session ID
    del sessionGameTable[sessionID]
    print("Cleared Game")
    return True

def handle_internal_error(error):
    return error

def handle_success(content):
    return jsonify(content), 200

def setSID(gameID, playerID, sessionID):
    if not playerID in gameTable[gameID]["player"]:
        return False

    # Mapping player id to session id
    gameTable[gameID]["player"] = sessionID
    # Mapping session id to game id
    sessionGameTable[sessionID] = gameID
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
    return handle_success({

    })

@app.route("/api/game/ai", methods=["GET"])
def game_ai():
    gameID = uuid4()
    playerID = uuid4()
    insertGame(gameID, playerID, GameType.AI)
    return handle_success({
        "ai" : True,
        "gid" : str(gameID),
        "pid" : str(playerID)
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

    gameIdentification = insertGame(gameID, {
        "pid" : playerID,
        "name" : playerName
    }, GameType.HUMAN)

    return handle_success({
        "gid" : gameIdentification
        })


@socketio.on("disconnect")
def disconnectHandler():
    sessID = request.sid
    clearGame(sessID)
    print("Disconnect handler triggered for {}".format(sessID))


@socketio.on("request::ai")
def connect(message):
    gameID = message["game"]
    playerID = message["player"]
    sessID = request.sid
    if gameExists(gameID, playerID):
        # Respond with success
        setSID(gameID, playerID, sessID)
        socketio.emit("request::role")

    else:
        # Disconnect the client
        print("Disconnected user due to incorrect details")
        disconnect(sessID)

if __name__ == '__main__':
    socketio.run(app)