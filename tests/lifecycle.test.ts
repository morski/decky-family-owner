import { it, expect, vi } from 'vitest';
import { Lifecycle } from '../src/services/lifecycle';
it('notifies mounted consumers before cleanup; tears down once even after errors', () => {
  const l = new Lifecycle(); const events: string[] = [];
  l.subscribe(() => { events.push(l.getSnapshot() ? 'active' : 'hidden'); });
  l.subscribe(() => { throw Error(); });
  const removed = vi.fn(); const unlisten = l.subscribe(removed); unlisten();
  l.addCleanup(() => { events.push('patch removed'); });
  l.addCleanup(() => { throw Error(); });
  l.dispose(); l.dispose(); expect(events).toEqual(['hidden', 'patch removed']); expect(removed).not.toHaveBeenCalled();
  const late = vi.fn(); l.addCleanup(late); expect(late).toHaveBeenCalledOnce();
  l.subscribe(removed); l.dispose(); expect(removed).not.toHaveBeenCalled();
});
