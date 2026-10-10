import type { ModuleId } from '../types';

export function Circuit({ id }: { id: ModuleId }) {
  return (
    <svg className="circuit-illustration" viewBox="0 0 250 86" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path className="circuit-guide" d="M0 43h250M125 0v86" strokeDasharray="2 5" />
      {id === 'input' && <>
        <path d="M13 43h26m-23 0c6-23 11-23 17 0s11 23 17 0" className="circuit-trace" />
        <path d="M62 43h17l34-31 34 31-34 31-34-31m68 0h26m-60-31v-7m0 69v7M173 43h17m9 0h34M190 30v26m9-26v26" />
        <path d="m86 30 13 3-5-12m27 0 13 5-4 9m-43 18 12 3-4 12m28-2 5-13 12 2" />
        <circle cx="62" cy="43" r="2.5" className="circuit-node" /><circle cx="233" cy="43" r="2.5" className="circuit-node" />
      </>}
      {id === 'transformer' && <>
        <path d="M19 21h57v-8h14c15 0 15 15 0 15 15 0 15 15 0 15 15 0 15 15 0 15 15 0 15 15 0 15H76v-8H19M231 21h-57v-8h-14c-15 0-15 15 0 15-15 0-15 15 0 15-15 0-15 15 0 15-15 0-15 15 0 15h14v-8h57" className="circuit-trace" />
        <path d="M119 11v64m12-64v64" strokeWidth="2" />
        <circle cx="19" cy="21" r="2.5" className="circuit-node" /><circle cx="19" cy="65" r="2.5" className="circuit-node" /><circle cx="231" cy="21" r="2.5" className="circuit-node" /><circle cx="231" cy="65" r="2.5" className="circuit-node" />
        <circle cx="72" cy="17" r="1.5" fill="currentColor" /><circle cx="178" cy="17" r="1.5" fill="currentColor" />
      </>}
      {id === 'switching' && <>
        <path d="M12 60h19V27h24v33h15V27h24v33h16" className="circuit-trace" />
        <path d="M135 43h27m0-20v40m8-40v15m0 10v15m0-20h30m-15 0V16h32m-32 27v27h32M170 28h15m-15 30h15" />
        <path d="m179 54-7 4 7 4" /><circle cx="217" cy="16" r="2.5" className="circuit-node" /><circle cx="217" cy="70" r="2.5" className="circuit-node" />
        <path d="M9 74h105" opacity=".2" />
      </>}
      {id === 'output' && <>
        <path d="M15 31h31c0-18 18-18 18 0 0-18 18-18 18 0 0-18 18-18 18 0 0-18 18-18 18 0h106M151 31v18m-11 0h22m-22 8h22m-11 0v16m-8 0h16m-13 5h10m-7 5h4" className="circuit-trace" />
        <circle cx="15" cy="31" r="2.5" className="circuit-node" /><circle cx="224" cy="31" r="2.5" className="circuit-node" /><circle cx="151" cy="31" r="2" fill="currentColor" />
        <path d="M183 60c5-6 10-6 15 0s10 6 15 0 10-6 15 0" opacity=".65" />
      </>}
    </svg>
  );
}