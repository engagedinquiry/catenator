import { inject, Injectable } from '@angular/core';
import { CompilerError } from '../model/models';
import { checkGrounding, GroundingReport } from './grounding';
import { refractOnce } from './refraction';
import { SessionStore } from './session-store';
import { transportFor } from './transports';

export interface RefractAllResult {
  grounding: GroundingReport[];
  /** Personas whose call failed, with the structured error surfaced to the author. */
  failures: Array<{ personaName: string; error: CompilerError }>;
}

@Injectable({ providedIn: 'root' })
export class RefractionService {
  private store = inject(SessionStore);

  /**
   * byok-compiler.contract micro.refract-all-personas-one-action:
   * a single call refracts every currently-defined persona (up to 2).
   */
  async refractAll(): Promise<RefractAllResult> {
    const apiKey = this.store.apiKey().trim();
    const provider = this.store.provider();
    const model = this.store.model().trim();
    const topicText = this.store.topicText();
    const sources = this.store.sources();
    const personas = this.store.personas();

    if (!apiKey) throw new Error('No API key set. Add one in Settings.');
    if (!personas.length) throw new Error('No personas defined.');

    const transport = transportFor(provider);
    const failures: RefractAllResult['failures'] = [];

    for (const persona of personas) {
      const outcome = await refractOnce(
        { apiKey, provider, model, topicText, sources, persona },
        transport
      );
      if (outcome.ok) {
        this.store.putRefraction(outcome.result);
      } else {
        failures.push({ personaName: persona.name, error: outcome.error });
      }
    }

    const grounding = this.store
      .refractions()
      .map((r) => checkGrounding(r, topicText, sources));

    return { grounding, failures };
  }
}
