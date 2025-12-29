const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { before, test } = require('node:test');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'passkey-backend-test-'));
process.env.DB_PATH = path.join(tempDir, 'database.sqlite');

const originalSetInterval = global.setInterval;
global.setInterval = (...args) => {
  const timer = originalSetInterval(...args);
  if (timer && typeof timer.unref === 'function') {
    timer.unref();
  }
  return timer;
};

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
  },
});

const { initDatabase } = require('../src/utils/database');
const db = require('../src/utils/database').default;
const UserModel = require('../src/models/User');
const ChallengeModel = require('../src/models/Challenge');

before(() => {
  initDatabase();
});

test('createUser stores user and verifies password', () => {
  const user = UserModel.createUser({
    username: 'alice',
    password: 'secret123',
  });

  assert.equal(user.username, 'alice');
  assert.ok(UserModel.isUsernameExists('alice'));

  const fetched = UserModel.getUserByUsername('alice');
  assert.ok(fetched);
  assert.equal(fetched.id, user.id);
  assert.ok(UserModel.verifyPassword(user, 'secret123'));
  assert.equal(UserModel.verifyPassword(user, 'wrongpass'), false);
});

test('createChallenge honors expiration and lookup helpers', () => {
  const user = UserModel.createUser({
    username: 'bob',
    password: 'password123',
  });

  const active = ChallengeModel.createChallenge({
    challenge: 'active-challenge',
    type: 'registration',
    userId: user.id,
  });

  assert.ok(active.id);
  const expireStmt = db.prepare(
    `UPDATE challenges SET expires_at = datetime('now', '-1 minutes') WHERE id = ?`
  );
  expireStmt.run(active.id);
  assert.equal(
    ChallengeModel.getValidChallenge('active-challenge', 'registration'),
    undefined
  );

  const valid = ChallengeModel.createChallenge({
    challenge: 'valid-challenge',
    type: 'registration',
    userId: user.id,
  });
  assert.ok(valid.id);
  assert.ok(
    ChallengeModel.getValidChallenge('valid-challenge', 'registration')
  );
  assert.ok(
    ChallengeModel.getChallengeByUserAndType(user.id, 'registration')
  );
});
