import { execSync } from 'node:child_process';

/** Remove the accounts the tests created so the dev database stays clean. */
export default function teardown() {
  execSync('npm --prefix ../server run cleanup:test-users', { stdio: 'inherit' });
}
