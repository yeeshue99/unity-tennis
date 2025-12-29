from flask import jsonify, request
from apiflask import APIBlueprint
from models import Matchup, SessionLocal, Bracket

matchups_bp = APIBlueprint('matchups', __name__)

@matchups_bp.before_request
def create_session():
    request.db = SessionLocal()

@matchups_bp.teardown_request
def close_session(exception=None):
    request.db.close()

@matchups_bp.route('/matchups', methods=['GET'])
def get_matchups():
    matchups = request.db.query(Matchup).all()
    return jsonify([{
        'id': matchup.id,
        'status': matchup.status,
        'score': matchup.score
    } for matchup in matchups])

@matchups_bp.route('/brackets/<int:bracket_id>/matchups', methods=['GET'])
def get_matchups_by_bracket(bracket_id):
    matchups = request.db.query(Matchup).filter(Matchup.bracket_id == bracket_id).all()

    if not matchups:
        return jsonify({'error': 'No matchups found for the given bracket'}), 404

    return jsonify([
        {
            'id': matchup.id,
            'bracket_id': matchup.bracket_id,
            'player1_id': matchup.player1_id,
            'player2_id': matchup.player2_id,
            'player1_partner_id': matchup.player1_partner_id,
            'player2_partner_id': matchup.player2_partner_id,
            'winner_id': matchup.winner_id,
            'score': matchup.score,
            'status': matchup.status
        }
        for matchup in matchups
    ])

@matchups_bp.route('/matchups', methods=['POST'])
def create_matchup():
    data = request.get_json()
    bracket_id = data.get('bracket_id')
    player1_id = data.get('player1_id')
    player2_id = data.get('player2_id')
    player1_partner_id = data.get('player1_partner_id')
    player2_partner_id = data.get('player2_partner_id')
    winner_id = data.get('winner_id')
    score = data.get('score')
    status = data.get('status')

    if not bracket_id or not player1_id or not player2_id or not status:
        return jsonify({'error': 'bracket_id, player1_id, player2_id, and status are required'}), 400

    matchup = Matchup(
        bracket_id=bracket_id,
        player1_id=player1_id,
        player2_id=player2_id,
        player1_partner_id=player1_partner_id,
        player2_partner_id=player2_partner_id,
        winner_id=winner_id,
        score=score,
        status=status
    )

    try:
        request.db.add(matchup)
        request.db.commit()
    except Exception as e:
        request.db.rollback()
        return jsonify({'error': str(e)}), 500

    return jsonify({
        'id': matchup.id,
        'bracket_id': matchup.bracket_id,
        'player1_id': matchup.player1_id,
        'player2_id': matchup.player2_id,
        'player1_partner_id': matchup.player1_partner_id,
        'player2_partner_id': matchup.player2_partner_id,
        'winner_id': matchup.winner_id,
        'score': matchup.score,
        'status': matchup.status
    }), 201

@matchups_bp.route('/matchups/generate', methods=['POST'])
def generate_matchups():
    data = request.get_json()
    bracket_id = data.get('bracket_id')
    format = data.get('format')

    if not bracket_id or not format:
        return jsonify({'error': 'bracket_id and format are required'}), 400

    # Fetch players in the bracket
    bracket = request.db.query(Bracket).filter(Bracket.id == bracket_id).first()

    if not bracket:
        return jsonify({'error': 'Bracket not found'}), 404

    players = [bp.player for bp in bracket.bracket_players]

    if not players:
        return jsonify({'error': 'No players found in the bracket'}), 404

    matchups = []

    if format == 'ROUND_ROBIN':
        for i in range(len(players)):
            for j in range(i + 1, len(players)):
                matchups.append(Matchup(bracket_id=bracket_id, player1_id=players[i].id, player2_id=players[j].id, status='PENDING'))
    elif format == 'SWISS':
        # Placeholder for SWISS format logic
        return jsonify({'error': 'SWISS format not implemented yet'}), 501
    else:
        return jsonify({'error': 'Invalid format'}), 400

    try:
        request.db.bulk_save_objects(matchups)
        request.db.commit()
    except Exception as e:
        request.db.rollback()
        return jsonify({'error': str(e)}), 500

    return jsonify([
        {
            'id': matchup.id,
            'bracket_id': matchup.bracket_id,
            'player1_id': matchup.player1_id,
            'player2_id': matchup.player2_id,
            'status': matchup.status
        }
        for matchup in matchups
    ]), 201
