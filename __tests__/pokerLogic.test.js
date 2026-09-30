import {
  HAND_RANKS,
  generateRandomHand,
  evaluateWinner,
  calculatePayout,
  getBotPersonality,
  formatCurrency
} from '../src/utils/pokerLogic';

describe('Poker Logic Functions', () => {
  describe('HAND_RANKS', () => {
    test('should have 10 hand ranks', () => {
      expect(Object.keys(HAND_RANKS).length).toBe(10);
    });

    test('should have correct rank values', () => {
      expect(HAND_RANKS.ROYAL_FLUSH.rank).toBe(10);
      expect(HAND_RANKS.HIGH_CARD.rank).toBe(1);
    });

    test('should have correct names', () => {
      expect(HAND_RANKS.ROYAL_FLUSH.name).toBe('ROYAL FLUSH');
      expect(HAND_RANKS.STRAIGHT_FLUSH.name).toBe('STRAIGHT FLUSH');
    });
  });

  describe('generateRandomHand', () => {
    test('should return a valid hand', () => {
      const hand = generateRandomHand();
      expect(hand).toBeDefined();
      expect(hand.rank).toBeDefined();
      expect(hand.name).toBeDefined();
    });

    test('should return one of the valid hands', () => {
      const validHands = Object.values(HAND_RANKS);
      const hand = generateRandomHand();
      expect(validHands).toContainEqual(hand);
    });

    test('should generate different hands', () => {
      const hands = new Set();
      for (let i = 0; i < 100; i++) {
        hands.add(generateRandomHand().rank);
      }
      expect(hands.size).toBeGreaterThan(1);
    });
  });

  describe('evaluateWinner', () => {
    test('should return empty array for empty players', () => {
      expect(evaluateWinner([])).toEqual([]);
      expect(evaluateWinner(null)).toEqual([]);
    });

    test('should identify single winner', () => {
      const players = [
        { hand: HAND_RANKS.HIGH_CARD },
        { hand: HAND_RANKS.ONE_PAIR },
        { hand: HAND_RANKS.TWO_PAIR }
      ];
      const winners = evaluateWinner(players);
      expect(winners).toEqual([2]);
    });

    test('should identify multiple winners with same hand', () => {
      const players = [
        { hand: HAND_RANKS.ONE_PAIR },
        { hand: HAND_RANKS.ONE_PAIR },
        { hand: HAND_RANKS.HIGH_CARD }
      ];
      const winners = evaluateWinner(players);
      expect(winners).toContain(0);
      expect(winners).toContain(1);
      expect(winners.length).toBe(2);
    });

    test('should handle undefined hand ranks', () => {
      const players = [
        { hand: undefined },
        { hand: HAND_RANKS.ONE_PAIR }
      ];
      const winners = evaluateWinner(players);
      expect(winners).toEqual([1]);
    });
  });

  describe('calculatePayout', () => {
    test('should divide pot equally among winners', () => {
      const payout = calculatePayout(1000, 1);
      expect(payout).toBe(1000);
    });

    test('should split pot for multiple winners', () => {
      const payout = calculatePayout(1000, 2);
      expect(payout).toBe(500);
    });

    test('should handle rounding down', () => {
      const payout = calculatePayout(1000, 3);
      expect(payout).toBe(333);
    });
  });

  describe('getBotPersonality', () => {
    test('should return personality for ProBot', () => {
      const personality = getBotPersonality('ProBot');
      expect(personality.style).toBe('aggressive');
      expect(personality.winRate).toBe(0.80);
      expect(personality.comments).toBeDefined();
    });

    test('should return personality for BalancedAI', () => {
      const personality = getBotPersonality('BalancedAI');
      expect(personality.style).toBe('strategic');
      expect(personality.winRate).toBe(0.60);
    });

    test('should return default personality for unknown bot', () => {
      const personality = getBotPersonality('UnknownBot');
      expect(personality.style).toBe('standard');
      expect(personality.winRate).toBe(0.50);
    });

    test('should have comments for all bots', () => {
      const bots = ['ProBot', 'BalancedAI', 'FishBot', 'SharpBot', 'CasualBot'];
      bots.forEach(bot => {
        const personality = getBotPersonality(bot);
        expect(personality.comments.bet).toBeDefined();
        expect(personality.comments.win).toBeDefined();
        expect(personality.comments.lose).toBeDefined();
        expect(personality.comments.fold).toBeDefined();
      });
    });
  });

  describe('formatCurrency', () => {
    test('should format small amounts', () => {
      expect(formatCurrency(100)).toBe('$100');
      expect(formatCurrency(999)).toBe('$999');
    });

    test('should format thousands', () => {
      expect(formatCurrency(1000)).toBe('$1.0K');
      expect(formatCurrency(5500)).toBe('$5.5K');
    });

    test('should format millions', () => {
      expect(formatCurrency(1000000)).toBe('$1.0M');
      expect(formatCurrency(5500000)).toBe('$5.5M');
    });

    test('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    test('should handle negative numbers', () => {
      expect(formatCurrency(-1000)).toBe('$-1.0K');
    });
  });
});
