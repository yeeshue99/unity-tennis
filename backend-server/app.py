from flask import Flask, jsonify, request
from models import SessionLocal, Player, Tournament, Matchup, Bracket, TournamentPlayer
from routes.players import players_bp
from routes.tournaments import tournaments_bp
from routes.matchups import matchups_bp
from routes.brackets import brackets_bp
from routes.tournament_players import tournament_players_bp
from apiflask import APIFlask

app = APIFlask(__name__)

# Database session
@app.before_request
def create_session():
    request.db = SessionLocal() # pyright: ignore[reportAttributeAccessIssue]

@app.teardown_request
def close_session(exception=None):
    request.db.close() # pyright: ignore[reportAttributeAccessIssue]

@app.route('/')
def home():
    return "Welcome to the UniTY Tennis Backend!"

# Register blueprints
app.register_blueprint(players_bp)
app.register_blueprint(tournaments_bp)
app.register_blueprint(matchups_bp)
app.register_blueprint(brackets_bp)
app.register_blueprint(tournament_players_bp)

if __name__ == '__main__':
    app.run(debug=True)
