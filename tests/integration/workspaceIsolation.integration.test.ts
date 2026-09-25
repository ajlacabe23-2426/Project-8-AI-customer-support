import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

/**
 * Run ONLY against a disposable, loopback Project 8 Supabase instance.
 * Never supply hosted or production keys to this test.
 */
const url = process.env.PROJECT8_TEST_API_URL;
const anonKey = process.env.PROJECT8_TEST_ANON_KEY;
const serviceKey = process.env.PROJECT8_TEST_SERVICE_ROLE_KEY;
const local = !!url && /^http:\/\/(127\.0\.0\.1|localhost):54321\/?$/.test(url);
const ready = local && !!anonKey && !!serviceKey;
const client = (key: string) => createClient(url!, key, { auth: { persistSession: false, autoRefreshToken: false } });

describe.skipIf(!ready)('disposable Project 8 two-owner RLS and visitor boundaries', () => {
  it('isolates workspace, knowledge, conversations, and human replies across owners', async () => {
    const admin = client(serviceKey!);
    const suffix = randomUUID().replace(/-/g, '');
    const password = 'local-Only-' + randomUUID() + '!';
    const users: string[] = [];
    try {
      const accounts = await Promise.all(['a', 'b'].map(async label => {
        const { data, error } = await admin.auth.admin.createUser({
          email: 'project8-' + label + '-' + suffix + '@example.invalid',
          password, email_confirm: true,
        });
        expect(error).toBeNull();
        expect(data.user).toBeTruthy();
        users.push(data.user!.id);
        const db = client(anonKey!);
        const login = await db.auth.signInWithPassword({ email: data.user!.email!, password });
        expect(login.error).toBeNull();
        return { id: data.user!.id, db };
      }));
      const [a, b] = accounts;
      const { data: workspaceA, error: aError } = await a.db.from('workspaces')
        .insert({ owner_id: a.id, name: 'Local owner A', slug: 'a-' + suffix,
          allowed_origins: ['http://localhost:3000'] }).select('id').single();
      expect(aError).toBeNull();
      const { data: workspaceB, error: bError } = await b.db.from('workspaces')
        .insert({ owner_id: b.id, name: 'Local owner B', slug: 'b-' + suffix,
          allowed_origins: ['http://localhost:3000'] }).select('id').single();
      expect(bError).toBeNull();
      const aId = workspaceA!.id, bId = workspaceB!.id;
      expect((await b.db.from('workspaces').select('id').eq('id', aId)).data).toEqual([]);
      expect((await a.db.from('workspaces').select('id').eq('id', bId)).data).toEqual([]);
      expect((await b.db.from('workspaces').insert({ owner_id: a.id, name: 'Forged',
        slug: 'forged-' + suffix, allowed_origins: [] })).error).toBeTruthy();
      const { data: article, error: articleError } = await a.db.from('knowledge')
        .insert({ workspace_id: aId, title: 'Local policy',
          body: 'This policy is a disposable integration test.' }).select('id').single();
      expect(articleError).toBeNull();
      expect((await b.db.from('knowledge').select('id').eq('id', article!.id)).data).toEqual([]);
      expect((await b.db.from('knowledge').insert({ workspace_id: aId,
        title: 'Forged article', body: 'This insertion must fail for another owner.' })).error).toBeTruthy();
      const { data: conversation, error: conversationError } = await admin.from('conversations')
        .insert({ workspace_id: aId, visitor_token: randomUUID() }).select('id').single();
      expect(conversationError).toBeNull();
      const conversationId = conversation!.id;
      expect((await admin.from('messages').insert({ conversation_id: conversationId,
        role: 'user', body: 'Hello from disposable visitor' })).error).toBeNull();
      expect((await b.db.from('conversations').select('id').eq('id', conversationId)).data).toEqual([]);
      expect((await b.db.from('messages').select('id').eq('conversation_id', conversationId)).data).toEqual([]);
      expect((await b.db.from('messages').insert({ conversation_id: conversationId,
        role: 'human', body: 'Cross-workspace reply' })).error).toBeTruthy();
      expect((await b.db.from('conversations').update({ status: 'closed' })
        .eq('id', conversationId).select('id')).data).toEqual([]);
      expect((await a.db.from('messages').insert({ conversation_id: conversationId,
        role: 'assistant', body: 'Forged assistant role' })).error).toBeTruthy();
      expect((await a.db.from('messages').insert({ conversation_id: conversationId,
        role: 'human', body: 'Authorized human reply' })).error).toBeNull();
      const anonymous = client(anonKey!);
      expect((await anonymous.from('conversations').select('id')).data).toEqual([]);
      expect((await anonymous.from('messages').select('id')).data).toEqual([]);
      expect((await anonymous.from('knowledge').select('id')).data).toEqual([]);
      expect((await anonymous.from('workspaces').select('id')).data).toEqual([]);
    } finally {
      for (const id of users) {
        const deleted = await admin.auth.admin.deleteUser(id);
        expect(deleted.error).toBeNull();
      }
    }
  }, 45_000);
});
