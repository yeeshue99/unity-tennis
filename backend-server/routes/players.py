from flask import jsonify, request
from apiflask import APIBlueprint
from models import Player, SessionLocal

players_bp = APIBlueprint('players', __name__)

@players_bp.before_request
def create_session():
    request.db = SessionLocal()

@players_bp.teardown_request
def close_session(exception=None):
    request.db.close()

@players_bp.route('/players', methods=['GET'])
def get_players():
    players = request.db.query(Player).all()
    return jsonify([{
        'id': player.id,
        'name': player.name,
        'gender': player.gender,
        'phone_number': player.phone_number
    } for player in players])

@players_bp.route('/players', methods=['POST'])
def add_player():
    data = request.get_json()
    name = data.get('name')
    gender = data.get('gender')
    phone_number = data.get('phone_number')

    if not name or not gender or not phone_number:
        return jsonify({'error': 'name, gender, and phone_number are required'}), 400

    player = Player(name=name, gender=gender, phone_number=phone_number)

    try:
        request.db.add(player)
        request.db.commit()
    except Exception as e:
        request.db.rollback()
        return jsonify({'error': str(e)}), 500

    return jsonify({
        'id': player.id,
        'name': player.name,
        'gender': player.gender,
        'phone_number': player.phone_number
    }), 201

@players_bp.route('/players/<int:player_id>', methods=['DELETE'])
def remove_player(player_id):
    player = request.db.query(Player).filter(Player.id == player_id).first()

    if not player:
        return jsonify({'error': 'Player not found'}), 404

    try:
        request.db.delete(player)
        request.db.commit()
    except Exception as e:
        request.db.rollback()
        return jsonify({'error': str(e)}), 500

    return jsonify({'message': 'Player removed from the registry successfully'})
