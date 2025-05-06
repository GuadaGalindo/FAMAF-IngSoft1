from unittest.mock import MagicMock, patch, AsyncMock
from fastapi.testclient import TestClient
from app.models.game_models import Game, Player
from app.main import app
from app.db.db import get_db
from app.dependencies.dependencies import get_game
from app.endpoints.game_endpoints import auth_scheme
from fastapi import WebSocket
from fastapi.encoders import jsonable_encoder
from app.db.enums import GameStatus
from app.endpoints.websocket_endpoints import handle_creation, handle_change, handle_deletion
import pytest
from app.endpoints.websocket_endpoints import game_list_manager
from app.services.game_services import convert_game_to_schema
from app.services.websocket_services import ConnectionManager, GameManager
from app.models.board_models import Board
from app.db.enums import Colors
from app.schemas.board_schemas import BoardSchemaOut


client = TestClient(app)


@pytest.fixture
def mock_websocket():
    return MagicMock(spec=WebSocket)


@pytest.fixture
def mock_game():
    game = MagicMock(spec=Game)
    game.id = 1
    game.name = "Mock Game"
    game.player_amount = 3
    game.host_id = 1
    game.player_turn = 0
    game.forbidden_color = Colors.none.value
    game.players = []
    game.status = GameStatus.waiting.value
    return game


@pytest.fixture
def mock_empty_game():
    game = MagicMock(spec=Game)
    game.id = 2

@pytest.fixture
def game_manager():
    manager = GameManager()
    manager.connection_manager = ConnectionManager()
    return manager


# === Game List's Websocket tests ===

@pytest.mark.asyncio
async def test_connect_game_list(mock_websocket, mock_game):
    """
    Test to see if the connect method is adding the websocket to the active connections list.
    """
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.all.return_value = [
        mock_game]

    expected_payload = [convert_game_to_schema(mock_game)]
    expected_message = {"type": "initial game list",
                        "message": "", "payload": jsonable_encoder(expected_payload)}

    with patch.object(mock_websocket, "send_json") as mock_send_json, patch("app.dependencies.dependencies.get_db", return_value=iter([mock_db])), patch("app.dependencies.dependencies.get_game_list", return_value=[mock_game]):
        await game_list_manager.connect(mock_websocket)
        assert mock_websocket in game_list_manager.connection_manager.active_connections
        await game_list_manager.broadcast_game_list(mock_websocket)
        mock_send_json.assert_called_once()
        assert mock_send_json.call_args_list[0][0][0] == expected_message
    app.dependency_overrides = {}


@pytest.mark.asyncio
async def test_disconnect_game_list(mock_websocket):
    """
    Test to see if the disconnect method is removing the websocket from the active connections list.
    """
    with patch.object(game_list_manager, "broadcast_game_list") as mock_broadcast_game_list, patch("app.dependencies.dependencies.get_game_list", return_value=[mock_game]):
        await game_list_manager.connect(mock_websocket)
        await game_list_manager.broadcast_game_list(mock_game)
        game_list_manager.disconnect(mock_websocket)
        mock_broadcast_game_list.assert_called_once()
        assert mock_websocket not in game_list_manager.connection_manager.active_connections
    app.dependency_overrides = {}


def test_all_listener_handlers(mock_game):
    """
    Test to see if the handlers (after_insert, after_delete, after_update) are calling the broadcast_game method.
    """
    with patch.object(game_list_manager, "broadcast_game") as mock_broadcast:
        handle_creation(None, None, mock_game)
        mock_broadcast.assert_called_once_with("game added", mock_game)
        mock_broadcast.reset_mock()
        handle_deletion(None, None, mock_game)
        mock_broadcast.assert_called_once_with("game deleted", mock_game)
        mock_broadcast.reset_mock()
        handle_change(None, None, mock_game)
        mock_broadcast.assert_called_once_with("game updated", mock_game)


@pytest.mark.asyncio
async def test_broadcast_correctly(mock_websocket, mock_game):
    """
    Test to see if the broadcast_game method is sending the correct message to the websocket.
    """

    with patch.object(mock_websocket, "send_json") as mock_send_json, patch.object(game_list_manager, "broadcast_game_list") as mock_broadcast_game_list:
        await game_list_manager.connect(mock_websocket)
        mock_game_schema = convert_game_to_schema(mock_game)
        expected_message = {
            "type": "game added",
            "message": "",
            "payload": mock_game_schema
        }
        expected_message_json = jsonable_encoder(expected_message)

        response = {}

        def capture_response(*args, **kwargs):
            nonlocal response
            response = args[0]

        mock_send_json.return_value = None
        mock_send_json.side_effect = capture_response

        await game_list_manager.broadcast_game("game added", mock_game)
        await game_list_manager.broadcast_game_list(mock_game)
        mock_send_json.assert_called_once()
        mock_broadcast_game_list.assert_called_once()
        assert response == expected_message_json


@pytest.mark.asyncio
async def test_multiple_broadcasting(mock_websocket, mock_game):
    """
    Test to see if the broadcast_game method is sending the correct message to multiple websockets.
    """
    with patch.object(game_list_manager, "broadcast_game_list") as mock_broadcast_game_list:
        mock_websocket2 = MagicMock(spec=WebSocket)
        with patch.object(mock_websocket, "send_json") as mock_send_json, patch.object(mock_websocket2, "send_json") as mock_send_json2:
            await game_list_manager.connect(mock_websocket)
            await game_list_manager.connect(mock_websocket2)

            expected_message = {
                "type": "game added",
                "message": "",
                "payload": convert_game_to_schema(mock_game)
            }
            expected_message_json = jsonable_encoder(expected_message)

            mock_send_json.return_value = None

            await game_list_manager.broadcast_game("game added", mock_game)
            await game_list_manager.broadcast_game_list(mock_game)
            await game_list_manager.broadcast_game_list(mock_game)

            assert mock_broadcast_game_list.call_count == 2
            mock_send_json.assert_called_once()
            mock_send_json2.assert_called_once()
            assert mock_send_json.call_args_list[0][0][0] == expected_message_json
            assert mock_send_json2.call_args_list[0][0][0] == expected_message_json


# === Game Connection's Websocket tests ===

@pytest.mark.asyncio
async def test_connect_game_add_game(mock_websocket):
    """
    Test to see if the connect method is adding the game to the active connections list.
    """
    game_connection_manager = GameManager()
    await game_connection_manager.connect(mock_websocket)
    assert mock_websocket in game_connection_manager.connection_manager.active_connections


@pytest.mark.asyncio
async def test_connect_created_game(mock_websocket):
    """
    Test a websocket that enters a channel that was created already.
    """
    game_connection_manager = GameManager()
    await game_connection_manager.connect(mock_websocket)
    assert mock_websocket in game_connection_manager.connection_manager.active_connections


@pytest.mark.asyncio
async def test_disconnect_game(mock_websocket):
    """
    Test to see if the disconnect method is removing the websocket from the active connections list.
    """
    game_connection_manager = GameManager()
    await game_connection_manager.connect(mock_websocket)
    game_connection_manager.disconnect(websocket=mock_websocket)
    assert mock_websocket not in game_connection_manager.connection_manager.active_connections


@pytest.mark.asyncio
async def test_broadcast_connection(mock_websocket, mock_game):
    """
    Test to see if the broadcast method is sending the correct message to the websocket.
    """
    mock_websocket2 = MagicMock(spec=WebSocket)
    game_connection_manager = GameManager()
    await game_connection_manager.connect(websocket=mock_websocket)
    await game_connection_manager.connect(websocket=mock_websocket2)

    expected_message = {
        "type": "player connected",
        "message": "Mock player se ha unido a la partida",
        "payload": convert_game_to_schema(mock_game)
    }
    expected_message_json = jsonable_encoder(expected_message)

    with patch.object(mock_websocket, "send_json") as mock_send_json, patch.object(mock_websocket2, "send_json") as mock_send_json2:
        await game_connection_manager.broadcast_connection(game=mock_game, player_id=1, player_name="Mock player")

        mock_send_json.assert_called_once()
        mock_send_json2.assert_called_once()

        assert mock_send_json.call_args_list[0][0][0] == expected_message_json
        assert mock_send_json2.call_args_list[0][0][0] == expected_message_json


@pytest.mark.asyncio
async def test_broadcast_disconnection(mock_websocket, mock_game):
    """
    Test to see if the broadcast method is sending the correct message to the websocket.
    """
    mock_websocket2 = MagicMock(spec=WebSocket)
    game_connection_manager = GameManager()
    await game_connection_manager.connect(websocket=mock_websocket)
    await game_connection_manager.connect(websocket=mock_websocket2)

    expected_message = {
        "type": "player disconnected",
        "message": "Mock player abandonó la partida",
        "payload": convert_game_to_schema(mock_game)
    }
    expected_message_json = jsonable_encoder(expected_message)

    with patch.object(mock_websocket, "send_json") as mock_send_json, patch.object(mock_websocket2, "send_json") as mock_send_json2:
        await game_connection_manager.broadcast_disconnection(game=mock_game, player_id=1, player_name="Mock player")

        mock_send_json.assert_called_once()
        mock_send_json2.assert_called_once()

        assert mock_send_json.call_args_list[0][0][0] == expected_message_json
        assert mock_send_json2.call_args_list[0][0][0] == expected_message_json


@pytest.mark.asyncio
async def test_broadcast_start(mock_websocket, mock_game):
    mock_websocket2 = MagicMock(spec=WebSocket)
    game_connection_manager = GameManager()
    await game_connection_manager.connect(websocket=mock_websocket)
    await game_connection_manager.connect(websocket=mock_websocket2)

    mock_game.status = GameStatus.in_game

    expected_message = {
        "type": "game started",
        "message": "Turno de Juan",
        "payload": convert_game_to_schema(mock_game)
    }
    expected_message_json = jsonable_encoder(expected_message)

    with patch.object(mock_websocket, "send_json") as mock_send_json, patch.object(mock_websocket2, "send_json") as mock_send_json2:
        await game_connection_manager.broadcast_game_start(mock_game, "Juan")

        mock_send_json.assert_called_once()
        mock_send_json2.assert_called_once()

        assert mock_send_json.call_args_list[0][0][0] == expected_message_json
        assert mock_send_json2.call_args_list[0][0][0] == expected_message_json


@pytest.mark.asyncio
async def test_websocket_game_reconnection(mock_websocket, mock_game):
    mock_websocket2 = MagicMock(spec=WebSocket)
    game_connection_manager = GameManager()
    await game_connection_manager.connect(websocket=mock_websocket)
    await game_connection_manager.connect(websocket=mock_websocket2)

    game_connection_manager.disconnect(mock_websocket)

    with patch.object(mock_websocket, "send_json") as mock_send_json, patch.object(mock_websocket2, "send_json") as mock_send_json2:

        await game_connection_manager.broadcast_game_start(mock_game, "")

        await game_connection_manager.connect(websocket=mock_websocket)

        await game_connection_manager.broadcast_game_start(mock_game, "")

        mock_send_json.assert_called_once()  # called strictly once
        mock_send_json2.assert_called()  # called at least once


# ------------------------------------------------- TESTS DE VICTORY CONDITIONS ---------------------------------------------------------
def test_victory_when_player_is_alone():
    with patch("app.endpoints.game_endpoints.game_connection_managers") as mock_manager:
        # Crear la sesión de base de datos mock
        mock_db = MagicMock()

        # Crear lista de jugadores y un juego mock
        mock_list_players = [
            Player(id=1, name="Juan", blocked=False),
            Player(id=2, name="Pedro", blocked=False)
        ]

        mock_game = Game(id=1, name="gametest", player_amount=2, status=GameStatus.in_game,
                         host_id=2, player_turn=1, players=mock_list_players,
                         forbidden_color=Colors.none)
        mock_manager[mock_game.id].broadcast_disconnection = AsyncMock(
            return_value=None)
        mock_manager[mock_game.id].broadcast_game_won = AsyncMock(
            return_value=None)

        mock_player = mock_list_players[0]  # Juan quiere abandonar
        mock_db.merge.return_value = mock_player

        # Sobrescribir dependencias con mocks
        app.dependency_overrides[get_db] = lambda: mock_db
        app.dependency_overrides[get_game] = lambda: mock_game
        app.dependency_overrides[auth_scheme] = lambda: mock_player
        
        def remove_player():
            new_players = [
                player for player in mock_game.players if player.id != mock_player.id]
            mock_game.players = new_players
            mock_player.game_id = None

        mock_db.commit.side_effect = remove_player

        # Hacer la petición PUT con el cliente de prueba
        response = client.put("/games/1/quit")
        # Asegurarse de que la respuesta fue exitosa
        assert response.status_code == 200
        assert response.json() == {
            "message": "Juan abandono la partida",
            'game': {
                'host_id': 2,
                'id': 1,
                'name': 'gametest',
                'player_amount': 0,
                'player_turn': 1,
                'players': [
                    {
                        'blocked': False,
                        'figure_cards': [],
                        'id': 2,
                        'movement_cards': [],
                        'name': 'Pedro',
                    },
                ],
                'status': 'finished',
                'forbidden_color': "none"
            },
        }

        # Verificar que se haya llamado a la función broadcast_game_won
        mock_manager[mock_game.id].broadcast_game_won.assert_called_once_with(
            mock_game, mock_list_players[1])

    # Restablecer dependencias sobrescritas
    app.dependency_overrides = {}


def test_no_victory_when_multiple_players_remain():
    with patch("app.endpoints.game_endpoints.game_connection_managers") as mock_manager:
        # Crear la sesión de base de datos mock
        mock_db = MagicMock()

        # Crear lista de jugadores y un juego mock
        mock_list_players = [
            Player(id=1, name="Juan", blocked=False),
            Player(id=2, name="Pedro", blocked=False),
            Player(id=3, name="Maria", blocked=False)
        ]

        mock_game = Game(id=1, name="gametest", player_amount=3, status=GameStatus.in_game,
                         host_id=2, player_turn=1, players=mock_list_players, forbidden_color=Colors.none)

        mock_manager[mock_game.id].broadcast_disconnection = AsyncMock(
            return_value=None)

        mock_player = mock_list_players[0]  # Juan quiere abandonar
        mock_db.merge.return_value = mock_player

        # Sobrescribir dependencias con mocks
        app.dependency_overrides[get_db] = lambda: mock_db
        app.dependency_overrides[get_game] = lambda: mock_game
        app.dependency_overrides[auth_scheme] = lambda: mock_player

        def remove_player():
            new_players = [
                player for player in mock_game.players if player.id != mock_player.id]
            mock_game.players = new_players
            mock_player.game_id = None

        mock_db.commit.side_effect = remove_player

        # Hacer la petición PUT con el cliente de prueba
        response = client.put("/games/1/quit")

        # Asegurarse de que la respuesta fue exitosa
        assert response.status_code == 200
        assert response.json() == {
            "message": "Juan abandono la partida",
            "game": {
                "id": 1,
                "name": "gametest",
                "player_amount": 2,
                "status": "in game",  # El estado sigue siendo 'in game'
                "host_id": 2,
                "player_turn": 1,
                "forbidden_color": "none",
                # Pedro y Maria quedan en el juego
                "players": [
                    {"id": 2, "name": "Pedro",
                        "movement_cards": [], "figure_cards": [], "blocked":False},
                    {"id": 3, "name": "Maria",
                        "movement_cards": [], "figure_cards": [], "blocked":False},
                ],
            }
        }

        # Verificar que no se haya llamado a la función broadcast_game_won
        mock_manager[mock_game.id].broadcast_game_won.assert_not_called()

    # Restablecer dependencias sobrescritas
    app.dependency_overrides = {}


@pytest.mark.asyncio
async def test_broadcast_board(mock_websocket, mock_game):
    with patch("app.endpoints.game_endpoints.game_connection_managers") as mock_manager, patch("random.shuffle", side_effect=lambda x: x):
        game_connection_manager = GameManager()
        mock_board = MagicMock(spec=Board)
        mock_board.color_distribution = []
        for _ in range(6):
            mock_board.color_distribution.append([Colors.red.value, Colors.blue.value, Colors.yellow.value,
                                                  Colors.green.value, Colors.red.value, Colors.blue.value])
        mock_game.board = mock_board

    with patch.object(mock_websocket, "send_json") as mock_send_json:
        await game_connection_manager.connect(websocket=mock_websocket)
        await game_connection_manager.broadcast_board(mock_game)

        mock_send_json.assert_called_once()
        assert mock_send_json.call_args_list[0][0][0]["type"] == "board"
        assert mock_send_json.call_args_list[0][0][0]["message"] == ""
        assert mock_send_json.call_args_list[0][0][0]["payload"][
            "color_distribution"] == mock_board.color_distribution


@pytest.mark.asyncio
async def test_broadcast_partial_board(mock_websocket):
    with patch("app.endpoints.game_endpoints.game_connection_managers") as mock_manager:
        game_connection_manager = GameManager()

        mock_board = MagicMock()
        mock_board.color_distribution = [[Colors.red.value, Colors.blue.value],
                                         [Colors.yellow.value, Colors.green.value],
                                         [Colors.red.value, Colors.blue.value]]

        mock_player = MagicMock()
        mock_player.id = 3
        mock_player.movements = [
            MagicMock(id=1, y1=0, x1=0, y2=1, x2=1, final_movement=False),
            MagicMock(id=2, y1=1, x1=0, y2=0, x2=1, final_movement=False),
            MagicMock(id=3, y1=0, x1=2, y2=1, x2=2, final_movement=False),
        ]

        mock_list_players = [
            Player(id=1, name="Juan"),
            Player(id=2, name="Pedro"),
            mock_player
        ]

        mock_game = MagicMock()
        mock_game = Game(id=1, players=mock_list_players, player_amount=3,
                         name="Game 1", status=GameStatus.in_game, host_id=1, player_turn=2)
        mock_game.board = mock_board

        expected_partial_board = [[Colors.green.value, Colors.yellow.value],
                                  [Colors.blue.value, Colors.red.value],
                                  [Colors.blue.value, Colors.red.value]]

        with patch.object(mock_websocket, "send_json") as mock_send_json:
            await game_connection_manager.connect(websocket=mock_websocket)
            await game_connection_manager.broadcast_partial_board(mock_game)

            sent_value = mock_send_json.call_args_list[0][0][0]

            assert mock_send_json.call_args_list[0][0][0]["type"] == "board"
            assert mock_send_json.call_args_list[0][0][0]["message"] == ""
            assert mock_send_json.call_args_list[0][0][0]["payload"]["color_distribution"] == expected_partial_board


@pytest.mark.asyncio
async def test_broadcast_figures_in_board(mock_websocket):
    with patch("app.endpoints.game_endpoints.game_connection_managers") as mock_manager:
        game_connection_manager = GameManager()

        figures = [
            {"figure": "figure1", "tiles": [{"x": 0, "y": 0}, {"x": 1, "y": 0}]},
            {"figure": "figure2", "tiles": [{"x": 2, "y": 0}, {"x": 3, "y": 0}]},
            {"figure": "figure3", "tiles": [{"x": 4, "y": 0}, {"x": 5, "y": 0}]}
        ]

        mock_player = MagicMock()
        mock_player.id = 3

        mock_list_players = [
            Player(id=1, name="Juan"),
            Player(id=2, name="Pedro"),
            mock_player
        ]

        mock_game = MagicMock()
        mock_game = Game(id=1, players=mock_list_players, player_amount=3,
                         name="Game 1", status=GameStatus.in_game, host_id=1, player_turn=2)

        expected_event_message = {
            "type": "figures",
            "message": "",
            "payload": figures
        }

        with patch("app.services.websocket_services.get_all_figures_in_board", return_value=figures):
            with patch.object(mock_websocket, "send_json") as mock_send_json:
                await game_connection_manager.connect(websocket=mock_websocket)
                await game_connection_manager.broadcast_figures_in_board(mock_game)

                sent_value = mock_send_json.call_args_list[0][0][0]

                assert sent_value["type"] == "figures"
                assert sent_value["message"] == ""
                assert sent_value["payload"] == figures