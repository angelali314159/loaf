// __tests__/firebase.test.ts

import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; // Assuming you might use Firestore as well

describe('Firebase Connection Check', () => {

  // This test checks if the default Firebase app instance is available.
  // If @react-native-firebase is correctly linked and initialized natively,
  // the default app instance should always be present.
  it('should have a default Firebase app instance initialized', () => {
    // firebase.apps returns an array of initialized apps.
    // If native setup is correct, the default app will be there.
    expect(firebase.apps.length).toBeGreaterThan(0);
    expect(firebase.apps[0].name).toBe('[DEFAULT]');
  });

  // This test checks if the Firebase Authentication module is accessible.
  // It doesn't try to log in, just confirms the module loads correctly.
  it('should expose the Authentication module', () => {
    expect(auth()).toBeDefined();
    expect(typeof auth).toBe('function');
  });

  // This test checks if the Firebase Firestore module is accessible.
  // It doesn't try to read/write data, just confirms the module loads correctly.
  it('should expose the Firestore module', () => {
    expect(firestore()).toBeDefined();
    expect(typeof firestore).toBe('function');
  });

  // Optional: A more advanced check could attempt a quick, harmless action
  // like fetching current user, but this can fail if no user is logged in
  // or if network is down. The above checks are more about *local* setup.
  it('should return null for current user if no one is logged in', async () => {
    // This is a simple smoke test, doesn't require network but validates auth() functionality
    const currentUser = auth().currentUser;
    // Assuming no user is logged in during a test run
    expect(currentUser).toBeNull();
  });
});
