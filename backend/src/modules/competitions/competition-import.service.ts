import { BadRequestException, Injectable } from '@nestjs/common';
import { CompetitionImportance } from '@prisma/client';
import * as XLSX from 'xlsx';
import pdfParse = require('pdf-parse');

export interface ParsedCompetitionCandidate {
  name?: string;
  eventDate: string; // ISO date
  importance: CompetitionImportance;
  expectedMatches?: number;
}

const IMPORTANCE_KEYWORDS: Array<[string, CompetitionImportance]> = [
  ['nazionale', CompetitionImportance.NAZIONALE],
  ['regionale', CompetitionImportance.REGIONALE],
  ['locale', CompetitionImportance.LOCALE],
];

const NAME_FIELDS = ['nome', 'torneo', 'name', 'evento', 'competizione'];
const DATE_FIELDS = ['data', 'date', 'eventdate', 'giorno'];
const IMPORTANCE_FIELDS = ['importanza', 'importance', 'livello'];
const MATCHES_FIELDS = ['partite', 'matches', 'numero partite', 'incontri'];

const LINE_DATE_REGEX = /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/;
const LINE_MATCHES_REGEX = /(\d+)\s*(partite|incontri|match(?:es)?)/i;

// Estrae candidati "torneo" da un calendario caricato dall'atleta (PDF, Excel o
// CSV) — mai persistiti direttamente: CompetitionsService li valida/crea uno per
// uno così ogni riga passa dallo stesso calcolo di tapering di una gara manuale.
@Injectable()
export class CompetitionImportService {
  async parse(file: { originalname: string; buffer: Buffer }): Promise<ParsedCompetitionCandidate[]> {
    const ext = (file.originalname.split('.').pop() ?? '').toLowerCase();

    if (ext === 'pdf') {
      return this.parsePdf(file.buffer);
    }
    if (ext === 'csv') {
      return this.parseSpreadsheet(file.buffer.toString('utf-8'), 'string');
    }
    if (ext === 'xlsx' || ext === 'xls') {
      return this.parseSpreadsheet(file.buffer, 'buffer');
    }
    throw new BadRequestException('Formato non supportato: carica un file PDF, Excel (.xlsx) o CSV.');
  }

  private parseSpreadsheet(input: string | Buffer, type: 'string' | 'buffer'): ParsedCompetitionCandidate[] {
    const workbook = XLSX.read(input, { type, cellDates: false });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

    const candidates: ParsedCompetitionCandidate[] = [];
    for (const row of rows) {
      const candidate = this.rowToCandidate(row);
      if (candidate) candidates.push(candidate);
    }
    return candidates;
  }

  private rowToCandidate(row: Record<string, unknown>): ParsedCompetitionCandidate | null {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[key.trim().toLowerCase()] = value;
    }

    const name = this.pickField(normalized, NAME_FIELDS);
    const rawDate = this.pickField(normalized, DATE_FIELDS);
    const rawImportance = this.pickField(normalized, IMPORTANCE_FIELDS);
    const rawMatches = this.pickField(normalized, MATCHES_FIELDS);

    const eventDate = this.toIsoDate(rawDate);
    if (!eventDate) return null;

    return {
      name: name != null ? String(name) : undefined,
      eventDate,
      importance: this.toImportance(rawImportance),
      expectedMatches: rawMatches != null && !Number.isNaN(Number(rawMatches)) ? Number(rawMatches) : undefined,
    };
  }

  private async parsePdf(buffer: Buffer): Promise<ParsedCompetitionCandidate[]> {
    const { text } = await pdfParse(buffer);
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const candidates: ParsedCompetitionCandidate[] = [];
    for (const line of lines) {
      const dateMatch = line.match(LINE_DATE_REGEX);
      if (!dateMatch) continue;
      const eventDate = this.toIsoDate(dateMatch[0]);
      if (!eventDate) continue;

      const name = line
        .replace(dateMatch[0], '')
        .replace(/^[-–—:,\s]+|[-–—:,\s]+$/g, '')
        .trim();
      const matchesMatch = line.match(LINE_MATCHES_REGEX);

      candidates.push({
        name: name.length > 0 ? name : undefined,
        eventDate,
        importance: this.toImportance(line),
        expectedMatches: matchesMatch ? Number(matchesMatch[1]) : undefined,
      });
    }
    return candidates;
  }

  private pickField(row: Record<string, unknown>, keys: string[]): unknown {
    for (const key of keys) {
      if (row[key] != null && row[key] !== '') return row[key];
    }
    return null;
  }

  private toIsoDate(value: unknown): string | null {
    if (value == null) return null;

    if (typeof value === 'number') {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (!parsed) return null;
      return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)).toISOString();
    }

    const str = String(value).trim();
    const dmy = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (dmy) {
      const [, d, m, y] = dmy;
      const year = y.length === 2 ? Number(y) + 2000 : Number(y);
      const date = new Date(Date.UTC(year, Number(m) - 1, Number(d)));
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }

    const parsed = Date.parse(str);
    return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
  }

  private toImportance(value: unknown): CompetitionImportance {
    if (value != null) {
      const str = String(value).trim().toLowerCase();
      for (const [keyword, importance] of IMPORTANCE_KEYWORDS) {
        if (str.includes(keyword)) return importance;
      }
    }
    return CompetitionImportance.REGIONALE;
  }
}
