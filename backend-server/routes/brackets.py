from flask import jsonify, request
from apiflask import APIBlueprint
from models import Bracket, SessionLocal

brackets_bp = APIBlueprint('brackets', __name__)

@brackets_bp.before_request
def create_session():
    request.db = SessionLocal()

@brackets_bp.teardown_request
def close_session(exception=None):
    request.db.close()

@brackets_bp.route('/brackets', methods=['GET'])
def get_brackets():
    brackets = request.db.query(Bracket).all()
    return jsonify([{
        'id': bracket.id,
        'tournament_id': bracket.tournament_id,
        'name': bracket.name
    } for bracket in brackets])

@brackets_bp.route('/brackets', methods=['POST'])
def create_bracket():
    data = request.get_json()
    tournament_id = data.get('tournament_id')
    name = data.get('name')

    if not tournament_id or not name:
        return jsonify({'error': 'tournament_id and name are required'}), 400

    bracket = Bracket(tournament_id=tournament_id, name=name)

    try:
        request.db.add(bracket)
        request.db.commit()
    except Exception as e:
        request.db.rollback()
        return jsonify({'error': str(e)}), 500

    return jsonify({
        'id': bracket.id,
        'tournament_id': bracket.tournament_id,
        'name': bracket.name
    }), 201

@brackets_bp.route('/brackets/<int:bracket_id>/players', methods=['GET'])
def get_bracket_players(bracket_id):
    bracket = request.db.query(Bracket).filter(Bracket.id == bracket_id).first()

    if not bracket:
        return jsonify({'error': 'Bracket not found'}), 404

    players = [
        {
            'id': bp.player.id,
            'name': bp.player.name,
            'gender': bp.player.gender,
            'phone_number': bp.player.phone_number
        }
        for bp in bracket.bracket_players
    ]

    return jsonify(players)
