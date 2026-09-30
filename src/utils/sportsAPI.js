/**
 * Sports API Integration
 * Fetches real game data from multiple sports sources
 */

// TheOddsAPI - Free tier available at theOddsAPI.com
// ESPN API - Free public API
// SofaScore API - Free sports data

class SportsAPIClient {
  constructor(apiKey = null) {
    this.theOddsApiKey = apiKey || process.env.REACT_APP_THEODDS_API_KEY;
    this.baseUrl = 'https://api.the-odds-api.com/v4';
  }

  /**
   * Get upcoming NFL games
   */
  async getNFLGames() {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports/americanfootball_nfl/events?apiKey=${this.theOddsApiKey}`
      );
      const data = await response.json();
      return this.formatGames(data.data, 'nfl');
    } catch (error) {
      console.error('Error fetching NFL games:', error);
      return [];
    }
  }

  /**
   * Get upcoming NBA games
   */
  async getNBAGames() {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports/basketball_nba/events?apiKey=${this.theOddsApiKey}`
      );
      const data = await response.json();
      return this.formatGames(data.data, 'nba');
    } catch (error) {
      console.error('Error fetching NBA games:', error);
      return [];
    }
  }

  /**
   * Get upcoming MLB games
   */
  async getMLBGames() {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports/baseball_mlb/events?apiKey=${this.theOddsApiKey}`
      );
      const data = await response.json();
      return this.formatGames(data.data, 'mlb');
    } catch (error) {
      console.error('Error fetching MLB games:', error);
      return [];
    }
  }

  /**
   * Get upcoming NHL games
   */
  async getNHLGames() {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports/icehockey_nhl/events?apiKey=${this.theOddsApiKey}`
      );
      const data = await response.json();
      return this.formatGames(data.data, 'nhl');
    } catch (error) {
      console.error('Error fetching NHL games:', error);
      return [];
    }
  }

  /**
   * Get all upcoming games across major sports
   */
  async getAllGames() {
    try {
      const [nfl, nba, mlb, nhl] = await Promise.all([
        this.getNFLGames(),
        this.getNBAGames(),
        this.getMLBGames(),
        this.getNHLGames()
      ]);

      return [...nfl, ...nba, ...mlb, ...nhl];
    } catch (error) {
      console.error('Error fetching all games:', error);
      return [];
    }
  }

  /**
   * Get odds for a specific event
   */
  async getOdds(eventId, sport) {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports/${this.sportMap(sport)}/events/${eventId}/odds?apiKey=${this.theOddsApiKey}`
      );
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching odds:', error);
      return null;
    }
  }

  /**
   * Format games to betting bot format
   */
  formatGames(events, sport) {
    if (!events) return [];

    return events.map(event => {
      const homeTeam = this.parseTeam(event.home_team);
      const awayTeam = this.parseTeam(event.away_team);

      return {
        id: event.id,
        sport,
        homeTeam: {
          name: homeTeam,
          abbrev: this.getAbbrev(homeTeam)
        },
        awayTeam: {
          name: awayTeam,
          abbrev: this.getAbbrev(awayTeam)
        },
        matchTime: new Date(event.commence_time),
        league: this.getLeague(sport),
        // Placeholder stats - would be populated from team data API
        homeOdds: 1.90,
        awayOdds: 1.90,
        homeTeamStats: {
          winRate: 0.5,
          ppg: 100,
          defenseRating: 105
        },
        awayTeamStats: {
          winRate: 0.5,
          ppg: 100,
          defenseRating: 105
        }
      };
    });
  }

  /**
   * Parse team name from API response
   */
  parseTeam(teamName) {
    // Clean up team names from API
    return teamName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get team abbreviation
   */
  getAbbrev(teamName) {
    const parts = teamName.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase();
  }

  /**
   * Map sport to API sport code
   */
  sportMap(sport) {
    const map = {
      nfl: 'americanfootball_nfl',
      nba: 'basketball_nba',
      mlb: 'baseball_mlb',
      nhl: 'icehockey_nhl',
      soccer: 'soccer_epl',
      tennis: 'tennis_atp'
    };
    return map[sport] || sport;
  }

  /**
   * Get league full name
   */
  getLeague(sport) {
    const leagues = {
      nfl: 'NFL',
      nba: 'NBA',
      mlb: 'MLB',
      nhl: 'NHL',
      soccer: 'Premier League',
      tennis: 'ATP'
    };
    return leagues[sport] || sport.toUpperCase();
  }
}

/**
 * Mock API for testing without API key
 */
class MockSportsAPI {
  async getAllGames() {
    return [
      {
        id: 'game1',
        sport: 'nfl',
        homeTeam: { name: 'Kansas City Chiefs', abbrev: 'KC' },
        awayTeam: { name: 'Buffalo Bills', abbrev: 'BUF' },
        matchTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        league: 'NFL',
        homeOdds: 1.95,
        awayOdds: 1.91,
        homeTeamStats: { winRate: 0.65, ppg: 28, defenseRating: 100 },
        awayTeamStats: { winRate: 0.62, ppg: 27, defenseRating: 95 }
      },
      {
        id: 'game2',
        sport: 'nba',
        homeTeam: { name: 'Los Angeles Lakers', abbrev: 'LAL' },
        awayTeam: { name: 'Boston Celtics', abbrev: 'BOS' },
        matchTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        league: 'NBA',
        homeOdds: 2.10,
        awayOdds: 1.75,
        homeTeamStats: { winRate: 0.60, ppg: 112, defenseRating: 110 },
        awayTeamStats: { winRate: 0.68, ppg: 115, defenseRating: 108 }
      },
      {
        id: 'game3',
        sport: 'mlb',
        homeTeam: { name: 'New York Yankees', abbrev: 'NYY' },
        awayTeam: { name: 'Boston Red Sox', abbrev: 'BOS' },
        matchTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        league: 'MLB',
        homeOdds: 1.85,
        awayOdds: 2.05,
        homeTeamStats: { winRate: 0.58, ppg: 4.5, defenseRating: 95 },
        awayTeamStats: { winRate: 0.54, ppg: 4.2, defenseRating: 98 }
      },
      {
        id: 'game4',
        sport: 'nhl',
        homeTeam: { name: 'New York Rangers', abbrev: 'NYR' },
        awayTeam: { name: 'Toronto Maple Leafs', abbrev: 'TOR' },
        matchTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        league: 'NHL',
        homeOdds: 1.88,
        awayOdds: 2.00,
        homeTeamStats: { winRate: 0.55, ppg: 2.8, defenseRating: 92 },
        awayTeamStats: { winRate: 0.60, ppg: 3.1, defenseRating: 90 }
      }
    ];
  }

  async getNFLGames() {
    const all = await this.getAllGames();
    return all.filter(g => g.sport === 'nfl');
  }

  async getNBAGames() {
    const all = await this.getAllGames();
    return all.filter(g => g.sport === 'nba');
  }

  async getMLBGames() {
    const all = await this.getAllGames();
    return all.filter(g => g.sport === 'mlb');
  }

  async getNHLGames() {
    const all = await this.getAllGames();
    return all.filter(g => g.sport === 'nhl');
  }
}

// Export based on API key availability
const sportsAPI = process.env.REACT_APP_THEODDS_API_KEY
  ? new SportsAPIClient(process.env.REACT_APP_THEODDS_API_KEY)
  : new MockSportsAPI();

export default sportsAPI;
export { SportsAPIClient, MockSportsAPI };
