const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
} = require('../../src/model/data/memory');

// Wait for a certain number of ms. Returns a Promise.
const wait = async (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));

describe('test in-Memory Database backend', () => {
  // test('readFragment() with empty fragment returns nothing', async () => {
  //   const returnedRead = await readFragment({ ownerId: '123', id: '1' });
  //   expect(returnedRead).toEqual(undefined);
  // });

  test('readFragment() returns nothing if id is not found', async () => {
    await writeFragment({ ownerId: '123', id: '1', fragment: 'fragment1' });
    const fragment = await readFragment('123', '2');
    expect(fragment).toEqual(undefined);
  });

  test('deleteFragment() throws error when id is not found', async () => {
    expect(() => deleteFragment('123', '1')).rejects.toThrow();
  });

  test('listFragment() throws an error if the id is not found', async () => {
    await writeFragment({ ownerId: '123', id: '1', fragment: 'fragment1' });
    expect(() => listFragments('111')).rejects.toThrow();
  });

  test('listFragment() returns array of fragments', async () => {
    await writeFragment({ ownerId: '123', id: '1', fragment: 'fragment1' });
    await writeFragmentData('123', '1', 'This is fragment1');

    await writeFragment({ ownerId: '123', id: '2', fragment: 'fragment2' });
    await writeFragmentData('123', '2', 'This is fragment2');

    await wait();
    const arrayOfIds = await listFragments('123');
    expect(Array.isArray(arrayOfIds)).toBe(true);
    expect(arrayOfIds).toEqual(['1', '2']);

    const fragments = await listFragments('123', true);
    expect(Array.isArray(fragments)).toBe(true);
    expect(fragments).toEqual([
      { ownerId: '123', id: '1', fragment: 'fragment1' },
      { ownerId: '123', id: '2', fragment: 'fragment2' },
    ]);
  });

  test('readFragment() returns a fragment that is written in writeFragment()', async () => {
    await writeFragment({ ownerId: '123', id: '1', fragment: 'fragment1' });
    const fragment = await readFragment('123', '1');
    expect(fragment).toEqual({ ownerId: '123', id: '1', fragment: 'fragment1' });
  });

  test('readFragment() returns a fragment that is written in writeFragment()', async () => {
    await writeFragment({ ownerId: '123', id: '1', fragment: 'fragment1' });
    await writeFragmentData('123', '1', 'This is fragment 1 via data');

    await wait();
    const fragment = await readFragmentData('123', '1');
    expect(fragment).toEqual('This is fragment 1 via data');
  });

  test('deleteFragment() deletes data from memory db', async () => {
    await writeFragment({ ownerId: '123', id: '1', fragment: 'fragment1' });
    await writeFragmentData('123', '1', 'This is fragment 1 via data');

    await wait();
    await deleteFragment('123', '1');
    const fragment = await readFragment('123', '1');
    expect(fragment).toBe(undefined);
  });
});
