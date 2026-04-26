const { pool } = require('../config/database');
const logger = require('../utils/logger');

class AnalysisService {
  constructor() {
    this.peptideCache = new Map();
    this.currentSessionId = null;
    this.loadPeptideDatabase();
  }

  // ─── Session context ──────────────────────────────────────────────────────

  /** Called by ArduinoService.setCurrentSession so stored results carry the right session FK. */
  setCurrentSession(sessionId) {
    this.currentSessionId = sessionId;
  }

  // ─── Cache ────────────────────────────────────────────────────────────────

  async loadPeptideDatabase() {
    try {
      const query = 'SELECT * FROM peptides WHERE active = true';
      const result = await pool.query(query);

      result.rows.forEach(peptide => {
        // reference_spectrum is JSONB — pg returns it already parsed as an array
        const spectrum = Array.isArray(peptide.reference_spectrum)
          ? peptide.reference_spectrum
          : (typeof peptide.reference_spectrum === 'string'
              ? JSON.parse(peptide.reference_spectrum)
              : []);

        this.peptideCache.set(peptide.id, {
          id:              peptide.id,
          name:            peptide.name,
          sequence:        peptide.sequence,
          molecularWeight: peptide.molecular_weight,
          spectrum,
          dangerLevel:     peptide.danger_level
        });
      });

      logger.info(`Loaded ${result.rows.length} peptides into cache`);
    } catch (error) {
      logger.error('Failed to load peptide database:', error);
    }
  }

  async reloadPeptideDatabase() {
    this.peptideCache.clear();
    await this.loadPeptideDatabase();
  }

  // ─── Live analysis ────────────────────────────────────────────────────────

  async analyzeSample(sensorData) {
    const spectrum = sensorData.spectrum;
    const matches  = [];

    for (const [peptideId, peptide] of this.peptideCache) {
      const similarity = this.calculateSpectralSimilarity(spectrum, peptide.spectrum);

      if (similarity > 0.5) {
        matches.push({
          peptideId:   peptideId,
          name:        peptide.name,
          sequence:    peptide.sequence,
          similarity:  similarity,
          confidence:  this.calculateConfidence(similarity, spectrum, peptide.spectrum),
          dangerLevel: peptide.dangerLevel
        });
      }
    }

    matches.sort((a, b) => b.confidence - a.confidence);

    const analysisResult = {
      timestamp:    sensorData.timestamp,
      matches:      matches.slice(0, 5),
      confidence:   matches.length > 0 ? matches[0].confidence : 0,
      dangerLevel:  matches.length > 0 ? matches[0].dangerLevel : 'safe',
      spectrumData: spectrum
    };

    await this.storeAnalysisResult(analysisResult);

    return analysisResult;
  }

  // ─── Post-session summary ─────────────────────────────────────────────────

  /**
   * Retrieve the best stored analysis result for a completed session.
   * Used by the analysis controller when a session is stopped.
   */
  async analyzeSession(sessionId) {
    try {
      const { rows } = await pool.query(
        `SELECT ar.*, p.name AS peptide_name, p.sequence, p.danger_level
         FROM analysis_results ar
         LEFT JOIN peptides p ON p.id = ar.peptide_id
         WHERE ar.session_id = $1
         ORDER BY ar.confidence_level DESC
         LIMIT 1`,
        [sessionId]
      );

      if (!rows.length) {
        return { match: null, confidence: 0, dangerLevel: 'safe', reason: 'No results stored for session' };
      }

      const best = rows[0];
      return {
        match: {
          id:       best.peptide_id,
          name:     best.peptide_name,
          sequence: best.sequence,
        },
        confidence:  parseFloat(best.confidence_level),
        dangerLevel: best.danger_level || 'safe',
        matchPercentage: parseFloat(best.match_percentage),
      };
    } catch (error) {
      logger.error('Failed to fetch session analysis:', error);
      return { match: null, confidence: 0, dangerLevel: 'safe' };
    }
  }

  // ─── Scoring ──────────────────────────────────────────────────────────────

  calculateSpectralSimilarity(spectrum1, spectrum2) {
    if (!spectrum1 || !spectrum2 || spectrum1.length === 0 || spectrum2.length === 0) {
      return 0;
    }

    const len = Math.min(spectrum1.length, spectrum2.length);
    let similarity = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < len; i++) {
      similarity += spectrum1[i] * spectrum2[i];
      norm1       += spectrum1[i] * spectrum1[i];
      norm2       += spectrum2[i] * spectrum2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return similarity / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  calculateConfidence(similarity, observedSpectrum, referenceSpectrum) {
    let confidence = similarity;
    const spectrumQuality  = this.assessSpectrumQuality(observedSpectrum);
    const referenceQuality = this.assessSpectrumQuality(referenceSpectrum);
    confidence *= spectrumQuality;
    confidence *= (0.5 + 0.5 * referenceQuality);
    return Math.min(confidence, 1.0);
  }

  assessSpectrumQuality(spectrum) {
    if (!spectrum || spectrum.length === 0) return 0;
    const mean     = spectrum.reduce((a, b) => a + b, 0) / spectrum.length;
    const variance = spectrum.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / spectrum.length;
    const snr      = mean / Math.sqrt(variance || 1);
    return Math.min(snr / 10, 1.0);
  }

  // ─── Persistence ─────────────────────────────────────────────────────────

  async storeAnalysisResult(analysisResult) {
    const query = `
      INSERT INTO analysis_results (session_id, peptide_id, match_percentage, confidence_level, detected_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    try {
      if (analysisResult.matches.length > 0) {
        const bestMatch = analysisResult.matches[0];
        const values = [
          this.currentSessionId,
          bestMatch.peptideId,
          bestMatch.similarity * 100,
          analysisResult.confidence,
          analysisResult.timestamp
        ];

        const result = await pool.query(query, values);
        return result.rows[0].id;
      }
    } catch (error) {
      logger.error('Failed to store analysis result:', error);
      throw error;
    }
  }
}

module.exports = AnalysisService;
