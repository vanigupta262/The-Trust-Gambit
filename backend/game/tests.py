from django.test import TestCase
from django.contrib.auth.models import User
from .models import Game, Round, Participant, Action, GameScore, Domain
from .scoring import calculate_scores_for_round

class ScoringEngineTest(TestCase):

    def setUp(self):
        self.game = Game.objects.create(name="Test Gambit", lambda_param=0.5, beta_param=0.2)
        self.domain = Domain.objects.create(name="Logic Puzzles")
        self.user_a = User.objects.create_user('user_a')
        self.p_a = Participant.objects.create(user=self.user_a)
        self.user_b = User.objects.create_user('user_b')
        self.p_b = Participant.objects.create(user=self.user_b)
        self.user_c = User.objects.create_user('user_c')
        self.p_c = Participant.objects.create(user=self.user_c)

    def test_correct_solve(self):
        round = Round.objects.create(game=self.game, domain=self.domain, round_number=1, question_text="Q1", correct_answer="42")
        Action.objects.create(round=round, participant=self.p_a, action_type='SOLVE', submitted_answer="42")
        calculate_scores_for_round(round.id)
        score = GameScore.objects.get(participant=self.p_a).score
        # This user was not delegated to, so their score is exactly 1.
        self.assertEqual(score, 1)

    def test_incorrect_solve(self):
        round = Round.objects.create(game=self.game, domain=self.domain, round_number=1, question_text="Q1", correct_answer="42")
        Action.objects.create(round=round, participant=self.p_a, action_type='SOLVE', submitted_answer="wrong")
        calculate_scores_for_round(round.id)
        score = GameScore.objects.get(participant=self.p_a).score
        self.assertEqual(score, -1)
    
    def test_pass_action(self):
        round = Round.objects.create(game=self.game, domain=self.domain, round_number=1, question_text="Q1", correct_answer="42")
        Action.objects.create(round=round, participant=self.p_a, action_type='PASS')
        calculate_scores_for_round(round.id)
        score = GameScore.objects.get(participant=self.p_a).score
        self.assertEqual(score, 0)

    def test_successful_delegation(self):
        round = Round.objects.create(game=self.game, domain=self.domain, round_number=1, question_text="Q1", correct_answer="ok")
        Action.objects.create(round=round, participant=self.p_a, action_type='DELEGATE', delegated_to=self.p_b)
        Action.objects.create(round=round, participant=self.p_b, action_type='SOLVE', submitted_answer="ok")
        calculate_scores_for_round(round.id)
        
        # B's score should be +1 (solve) + 0.2 (bonus) = 1.2
        score_b = GameScore.objects.get(participant=self.p_b).score
        # FIX: Changed assertion to expect the correct total score including the bonus.
        self.assertAlmostEqual(score_b, 1.2)

        # A's score should be lambda * B's points = 0.5 * 1.2 = 0.6
        score_a = GameScore.objects.get(participant=self.p_a).score
        self.assertAlmostEqual(score_a, 0.6)

    def test_unsuccessful_delegation(self):
        round = Round.objects.create(game=self.game, domain=self.domain, round_number=1, question_text="Q1", correct_answer="ok")
        Action.objects.create(round=round, participant=self.p_a, action_type='DELEGATE', delegated_to=self.p_b)
        Action.objects.create(round=round, participant=self.p_b, action_type='SOLVE', submitted_answer="wrong")
        calculate_scores_for_round(round.id)
        score_b = GameScore.objects.get(participant=self.p_b).score
        self.assertEqual(score_b, -1)
        score_a = GameScore.objects.get(participant=self.p_a).score
        self.assertEqual(score_a, -2)

    def test_reputation_bonus(self):
        round = Round.objects.create(game=self.game, domain=self.domain, round_number=1, question_text="Q1", correct_answer="win")
        Action.objects.create(round=round, participant=self.p_b, action_type='DELEGATE', delegated_to=self.p_a)
        Action.objects.create(round=round, participant=self.p_c, action_type='DELEGATE', delegated_to=self.p_a)
        Action.objects.create(round=round, participant=self.p_a, action_type='SOLVE', submitted_answer="win")
        calculate_scores_for_round(round.id)
        score_a = GameScore.objects.get(participant=self.p_a).score
        self.assertAlmostEqual(score_a, 1.4)
    
    def test_delegation_cycle(self):
        round = Round.objects.create(game=self.game, domain=self.domain, round_number=1, question_text="Q1", correct_answer="any")
        Action.objects.create(round=round, participant=self.p_a, action_type='DELEGATE', delegated_to=self.p_b)
        Action.objects.create(round=round, participant=self.p_b, action_type='DELEGATE', delegated_to=self.p_c)
        Action.objects.create(round=round, participant=self.p_c, action_type='DELEGATE', delegated_to=self.p_a)
        calculate_scores_for_round(round.id)
        score_a = GameScore.objects.get(participant=self.p_a).score
        score_b = GameScore.objects.get(participant=self.p_b).score
        score_c = GameScore.objects.get(participant=self.p_c).score
        self.assertEqual(score_a, -1)
        self.assertEqual(score_b, -1)
        self.assertEqual(score_c, -1)